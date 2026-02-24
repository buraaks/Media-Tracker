<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$input = getInput();
$token = trim($input['token'] ?? '');

if ($token === '') {
    jsonError('Gecersiz veya eksik dogrulama kodu.');
}

$db = getDB();

$stmt = $db->prepare('SELECT id FROM users WHERE verification_token = ?');
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user) {
    jsonError('Bu dogrulama kodu gecersiz veya suresi dolmus.', 400);
}

$stmt = $db->prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?');
$stmt->execute([$user['id']]);

jsonResponse([
    'success' => true,
    'message' => 'E-posta adresiniz basariyla dogrulandi.'
]);
