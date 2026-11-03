<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

// Public endpoint only. Configuration, dependencies and rate files stay outside public_html.
ini_set('display_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

const AEGIS_RECIPIENT = 'tanayagarwal@agentichft.online';
const AEGIS_ORIGINS = ['https://agentichft.online', 'https://www.agentichft.online'];
const AEGIS_MAX_BODY = 8192;

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function unavailable(string $token = ''): void
{
    respond(503, [
        'ok' => false,
        'ready' => false,
        'csrfToken' => $token,
        'message' => 'The contact form is not connected yet. Please email tanayagarwal@agentichft.online.',
    ]);
}

function outsidePublicRoot(string $path): bool
{
    $resolved = realpath($path);
    if ($resolved === false) {
        return false;
    }
    $roots = [realpath(dirname(__DIR__)), realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''))];
    foreach ($roots as $root) {
        if ($root === false || $root === '') {
            continue;
        }
        $prefix = rtrim(str_replace('\\', '/', $root), '/') . '/';
        $candidate = str_replace('\\', '/', $resolved);
        if (strncasecmp($candidate, $prefix, strlen($prefix)) === 0 || strcasecmp($candidate, rtrim($prefix, '/')) === 0) {
            return false;
        }
    }
    return true;
}

function validHeaderValue(string $value): bool
{
    return preg_match('/[\x00-\x1F\x7F]/', $value) === 0;
}

function loadConfiguration(): ?array
{
    $path = getenv('AEGIS_CONTACT_CONFIG');
    if (!is_string($path) || $path === '' || !is_file($path) || !is_readable($path) || !outsidePublicRoot($path)) {
        return null;
    }
    try {
        $config = @require $path;
    } catch (Throwable $e) {
        return null;
    }
    if (!is_array($config)) {
        return null;
    }
    foreach (['smtpHost', 'smtpUsername', 'smtpPassword', 'fromEmail', 'fromName', 'encryption', 'autoload', 'rateDirectory', 'rateSecret'] as $key) {
        if (!isset($config[$key]) || !is_string($config[$key]) || trim($config[$key]) === '') {
            return null;
        }
    }
    if ($config['smtpHost'] !== 'smtp.hostinger.com'
        || !validHeaderValue($config['smtpUsername'])
        || !validHeaderValue($config['fromName'])
        || !filter_var($config['smtpUsername'], FILTER_VALIDATE_EMAIL)
        || !filter_var($config['fromEmail'], FILTER_VALIDATE_EMAIL)
        || !validHeaderValue($config['fromEmail'])
        || !str_ends_with(strtolower($config['fromEmail']), '@agentichft.online')
        || $config['fromEmail'] !== $config['smtpUsername']
        || str_contains($config['smtpPassword'], 'REPLACE_')
        || strlen($config['rateSecret']) < 32
        || str_contains($config['rateSecret'], 'REPLACE_')) {
        return null;
    }
    $port = $config['smtpPort'] ?? null;
    if (!(($port === 465 && $config['encryption'] === 'smtps') || ($port === 587 && $config['encryption'] === 'starttls'))) {
        return null;
    }
    $origins = $config['allowedOrigins'] ?? null;
    if (!is_array($origins) || !in_array('https://agentichft.online', $origins, true)
        || count($origins) !== count(array_unique($origins)) || array_diff($origins, AEGIS_ORIGINS) !== []) {
        return null;
    }
    if (!is_file($config['autoload']) || !is_readable($config['autoload']) || !outsidePublicRoot($config['autoload'])
        || !is_dir($config['rateDirectory']) || !is_writable($config['rateDirectory']) || !outsidePublicRoot($config['rateDirectory'])) {
        return null;
    }
    try {
        @require_once $config['autoload'];
    } catch (Throwable $e) {
        return null;
    }
    if (!class_exists(PHPMailer::class)) {
        return null;
    }
    return $config;
}

/** Store only HMAC identifiers and attempt timestamps; never message text or raw IP addresses. */
function reserveAttempt(array $config): array
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    // Do not trust client-supplied forwarding headers. A proxy needs host-managed trusted IP configuration.
    $key = hash_hmac('sha256', $ip, $config['rateSecret']);
    $file = rtrim($config['rateDirectory'], '/\\') . DIRECTORY_SEPARATOR . $key . '.json';
    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        return ['available' => false];
    }
    @chmod($file, 0600);
    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        return ['available' => false];
    }
    try {
        $raw = stream_get_contents($handle, 4097);
        if ($raw === false || strlen($raw) > 4096) {
            return ['available' => false];
        }
        $prior = $raw === '' ? [] : json_decode($raw, true);
        if (!is_array($prior)) {
            return ['available' => false];
        }
        $now = time();
        $attempts = array_values(array_filter($prior, static fn ($stamp): bool => is_int($stamp) && $stamp > $now - 3600 && $stamp <= $now));
        sort($attempts, SORT_NUMERIC);
        $latest = $attempts === [] ? 0 : $attempts[count($attempts) - 1];
        if (count($attempts) >= 5 || $now - $latest < 30) {
            $retry = count($attempts) >= 5 ? max(1, $attempts[0] + 3600 - $now) : max(1, 30 - ($now - $latest));
            return ['available' => true, 'allowed' => false, 'retryAfter' => $retry];
        }
        $attempts[] = $now;
        $encoded = json_encode($attempts);
        if ($encoded === false || !ftruncate($handle, 0) || !rewind($handle) || fwrite($handle, $encoded) !== strlen($encoded) || !fflush($handle)) {
            return ['available' => false];
        }
        return ['available' => true, 'allowed' => true];
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

try {
    if (PHP_VERSION_ID < 80200 || !extension_loaded('openssl') || !extension_loaded('mbstring')) {
        unavailable();
    }
    $method = (string) ($_SERVER['REQUEST_METHOD'] ?? '');
    if (!in_array($method, ['GET', 'POST'], true)) {
        header('Allow: GET, POST');
        respond(405, ['ok' => false, 'message' => 'Use GET or POST.']);
    }
    $isHttps = in_array(strtolower((string) ($_SERVER['HTTPS'] ?? '')), ['on', '1'], true)
        || ($_SERVER['REQUEST_SCHEME'] ?? '') === 'https';
    if (!$isHttps) {
        unavailable();
    }
    $config = loadConfiguration();
    $origins = $config['allowedOrigins'] ?? ['https://agentichft.online'];
    $siteOrigin = 'https://' . strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    if (!in_array($siteOrigin, $origins, true)) {
        respond(403, ['ok' => false, 'message' => 'This contact form is available on agentichft.online.']);
    }
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    $fetchSite = (string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '');
    if (($origin !== '' && $origin !== $siteOrigin) || ($fetchSite !== '' && !in_array($fetchSite, ['same-origin', 'none'], true))) {
        respond(403, ['ok' => false, 'message' => 'Please submit the form from the website.']);
    }
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('AEGIS_CONTACT_SESS');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/api/', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict']);
    if (!@session_start()) {
        unavailable();
    }
    if (!isset($_SESSION['aegis_csrf'], $_SESSION['aegis_csrf_created'])
        || !is_string($_SESSION['aegis_csrf']) || !is_int($_SESSION['aegis_csrf_created'])
        || $_SESSION['aegis_csrf_created'] < time() - 7200) {
        $_SESSION['aegis_csrf'] = bin2hex(random_bytes(32));
        $_SESSION['aegis_csrf_created'] = time();
    }
    $token = $_SESSION['aegis_csrf'];
    session_write_close();
    if ($method === 'GET') {
        if ($config === null) {
            unavailable($token);
        }
        respond(200, ['ready' => true, 'csrfToken' => $token, 'message' => 'Contact form configured. SMTP credentials are checked only when sending.']);
    }
    if ($config === null) {
        unavailable($token);
    }
    if ($origin !== $siteOrigin || ($fetchSite !== '' && $fetchSite !== 'same-origin')) {
        respond(403, ['ok' => false, 'message' => 'Please submit the form from the website.']);
    }
    $submittedToken = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if (strlen($submittedToken) !== 64 || !hash_equals($token, $submittedToken)) {
        respond(403, ['ok' => false, 'message' => 'Your form session expired. Reload the page and try again.']);
    }
    if (strtolower(trim(explode(';', (string) ($_SERVER['CONTENT_TYPE'] ?? ''))[0])) !== 'application/json') {
        respond(415, ['ok' => false, 'message' => 'The form must send JSON.']);
    }
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > AEGIS_MAX_BODY) {
        respond(413, ['ok' => false, 'message' => 'Your message is too large. Please shorten it.']);
    }
    $stream = fopen('php://input', 'rb');
    $raw = $stream === false ? false : stream_get_contents($stream, AEGIS_MAX_BODY + 1);
    if (is_resource($stream)) {
        fclose($stream);
    }
    if ($raw === false || strlen($raw) > AEGIS_MAX_BODY) {
        respond(413, ['ok' => false, 'message' => 'Your message is too large. Please shorten it.']);
    }
    $rate = reserveAttempt($config);
    if (!$rate['available']) {
        unavailable($token);
    }
    if (!$rate['allowed']) {
        header('Retry-After: ' . $rate['retryAfter']);
        respond(429, ['ok' => false, 'message' => 'Please wait before sending another enquiry.', 'retryAfter' => $rate['retryAfter']]);
    }
    try {
        $payload = json_decode($raw, true, 8, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        respond(400, ['ok' => false, 'message' => 'Please check the form and try again.']);
    }
    if (!is_array($payload) || array_is_list($payload)) {
        respond(400, ['ok' => false, 'message' => 'Please check the form and try again.']);
    }
    foreach (['name', 'email', 'topic', 'message', 'website'] as $field) {
        if (!isset($payload[$field]) || !is_string($payload[$field]) || preg_match('//u', $payload[$field]) !== 1) {
            respond(400, ['ok' => false, 'message' => 'Please complete every required field.']);
        }
    }
    if (trim($payload['website']) !== '') {
        respond(400, ['ok' => false, 'message' => 'This submission could not be accepted.']);
    }
    $name = trim($payload['name']);
    $email = trim($payload['email']);
    $topic = trim($payload['topic']);
    $message = trim(str_replace(["\r\n", "\r"], "\n", $payload['message']));
    if (mb_strlen($name, 'UTF-8') < 2 || mb_strlen($name, 'UTF-8') > 100 || !validHeaderValue($name)
        || strlen($email) > 254 || !validHeaderValue($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)
        || mb_strlen($topic, 'UTF-8') < 2 || mb_strlen($topic, 'UTF-8') > 80 || !validHeaderValue($topic)
        || mb_strlen($message, 'UTF-8') < 20 || mb_strlen($message, 'UTF-8') > 3000
        || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $message) !== 0
        || ($payload['consent'] ?? false) !== true) {
        respond(400, ['ok' => false, 'message' => 'Check your name, email, topic and message, and agree to contact processing.']);
    }

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->SMTPDebug = 0;
    $mail->Host = $config['smtpHost'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtpUsername'];
    $mail->Password = $config['smtpPassword'];
    $mail->SMTPSecure = $config['encryption'] === 'smtps' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config['smtpPort'];
    $mail->Timeout = 15;
    $mail->Timelimit = 30;
    $mail->SMTPKeepAlive = false;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    // PHPMailer defaults verify TLS peers and hostnames. Do not disable SMTPOptions verification.
    $mail->setFrom($config['fromEmail'], $config['fromName']);
    $mail->addAddress(AEGIS_RECIPIENT);
    $mail->addReplyTo($email, $name);
    $mail->Subject = 'Aegis Quant website enquiry';
    $mail->isHTML(false);
    $mail->Body = "Aegis Quant website enquiry\n\nName: {$name}\nEmail: {$email}\nTopic: {$topic}\n\n{$message}\n\nContact processing consent: given.\n";
    if (!$mail->send()) {
        respond(503, ['ok' => false, 'message' => 'Your message could not be accepted. Please try later or email tanayagarwal@agentichft.online.']);
    }
    respond(200, ['ok' => true, 'message' => 'Message accepted for delivery.']);
} catch (Throwable $e) {
    // Never expose SMTP details, stack traces, credentials, visitor messages or IP addresses.
    respond(503, ['ok' => false, 'ready' => false, 'message' => 'Your message could not be accepted. Please try later or email tanayagarwal@agentichft.online.']);
}
