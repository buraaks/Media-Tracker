<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$auth  = requireAuth();
$input = getInput();

$currentPassword = $input['currentPassword'] ?? '';
if ($currentPassword === '') {
    jsonError('Mevcut sifre gerekli.');
}

$db   = getDB();
$stmt = $db->prepare('SELECT id, username, email, password_hash FROM users WHERE id = ?');
$stmt->execute([$auth['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    jsonError('Kullanici bulunamadi.', 404);
}

if (!password_verify($currentPassword, $user['password_hash'])) {
    jsonError('Mevcut sifre hatali.', 401);
}

$newUsername = trim($input['username'] ?? '');
$newEmail   = trim($input['email'] ?? '');
$newPassword = $input['newPassword'] ?? '';

if ($newUsername === '') $newUsername = $user['username'];
if ($newEmail === '')   $newEmail   = $user['email'];

if (strlen($newUsername) < 3 || strlen($newUsername) > 50) {
    jsonError('Kullanici adi 3-50 karakter olmali.');
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $newUsername)) {
    jsonError('Kullanici adi sadece harf, rakam ve alt cizgi icerebilir.');
}

if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
    jsonError('Gecerli bir e-posta adresi girin.');
}

if ($newUsername !== $user['username']) {
    $stmt = $db->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
    $stmt->execute([$newUsername, $user['id']]);
    if ($stmt->fetch()) {
        jsonError('Bu kullanici adi zaten kullaniliyor.');
    }
}

if ($newEmail !== $user['email']) {
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
    $stmt->execute([$newEmail, $user['id']]);
    if ($stmt->fetch()) {
        jsonError('Bu e-posta adresi zaten kullaniliyor.');
    }
}

if ($newPassword !== '') {
    if (strlen($newPassword) < 6) {
        jsonError('Yeni sifre en az 6 karakter olmali.');
    }
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?');
    $stmt->execute([$newUsername, $newEmail, $hash, $user['id']]);
} else {
    $stmt = $db->prepare('UPDATE users SET username = ?, email = ? WHERE id = ?');
    $stmt->execute([$newUsername, $newEmail, $user['id']]);
}

$token = generateToken((int) $user['id'], $newUsername);

jsonResponse([
    'success' => true,
    'message' => 'Profil guncellendi.',
    'token'   => $token,
    'user'    => [
        'id'       => (int) $user['id'],
        'username' => $newUsername,
        'email'    => $newEmail,
    ],
]);
