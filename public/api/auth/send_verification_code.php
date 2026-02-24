<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$auth = requireAuth();

$db = getDB();

// 1. Check if user is already verified
$stmt = $db->prepare('SELECT id, email, email_verified, username FROM users WHERE id = ?');
$stmt->execute([$auth['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    jsonError('Kullanici bulunamadi.', 404);
}

if ($user['email_verified']) {
    jsonError('E-posta adresiniz zaten dogrulanmis.', 400);
}

// 2. Generate new 6-digit code
$code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);

// 3. Save code to database
$stmt = $db->prepare('UPDATE users SET verification_token = ? WHERE id = ?');
$stmt->execute([$code, $auth['user_id']]);

// 4. Send email
sendVerificationEmail($user['email'], $user['username'], $code);

jsonResponse([
    'success' => true,
    'message' => 'Dogrulama kodu e-posta adresinize gonderildi.'
]);
