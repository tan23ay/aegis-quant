<?php
declare(strict_types=1);

// SETUP TEMPLATE ONLY: copy this OUTSIDE public_html as contact-config.php.
// Never send the real password in chat, commit it, or put it in browser JavaScript.
return [
    'smtpHost' => 'smtp.hostinger.com',
    'smtpPort' => 465,
    'encryption' => 'smtps', // Alternative: smtpPort 587 with encryption 'starttls'.
    'smtpUsername' => 'tanayagarwal@agentichft.online',
    'smtpPassword' => 'REPLACE_WITH_HOSTINGER_MAILBOX_PASSWORD',
    'fromEmail' => 'tanayagarwal@agentichft.online', // Must match the authenticated mailbox.
    'fromName' => 'Aegis Quant enquiries',
    'allowedOrigins' => ['https://agentichft.online'],
    // Add 'https://www.agentichft.online' only if www is deliberately enabled with HTTPS.
    'autoload' => __DIR__ . '/vendor/autoload.php',
    'rateDirectory' => __DIR__ . '/contact-rates',
    'rateSecret' => 'REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS',
];
