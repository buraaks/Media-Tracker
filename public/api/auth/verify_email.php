<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$auth = requireAuth();
$input = getInput();
$code = trim($input['code'] ?? '');

if ($code === '' || strlen($code) !== 6) {
    jsonError('Gecersiz veya eksik dogrulama kodu. 6 haneli kodu girin.');
}

$db = getDB();

$stmt = $db->prepare('SELECT id, verification_token FROM users WHERE id = ?');
$stmt->execute([$auth['user_id']]);
$user = $stmt->fetch();

if (!$user || $user['verification_token'] !== $code) {
    jsonError('Girdiginiz dogrulama kodu hatali.', 400);
}

$stmt = $db->prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?');
$stmt->execute([$user['id']]);

jsonResponse([
    'success' => true,
    'message' => 'E-posta adresiniz basariyla dogrulandi.'
]);
