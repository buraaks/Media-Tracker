<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$input    = getInput();
$username = trim($input['username'] ?? '');
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($username === '' || $email === '' || $password === '') {
    jsonError('Tum alanlar gerekli.');
}

if (strlen($username) < 3 || strlen($username) > 50) {
    jsonError('Kullanici adi 3-50 karakter olmali.');
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    jsonError('Kullanici adi sadece harf, rakam ve alt cizgi icerebilir.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonError('Gecerli bir e-posta adresi girin.');
}

if (strlen($password) < 6) {
    jsonError('Sifre en az 6 karakter olmali.');
}

$db = getDB();

$stmt = $db->prepare('SELECT id FROM users WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetch()) {
    jsonError('Bu kullanici adi zaten kullaniliyor.');
}

$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonError('Bu e-posta adresi zaten kullaniliyor.');
}

$passwordHash      = password_hash($password, PASSWORD_DEFAULT);
$verificationToken = bin2hex(random_bytes(32));

$stmt = $db->prepare('INSERT INTO users (username, email, password_hash, verification_token) VALUES (?, ?, ?, ?)');
$stmt->execute([$username, $email, $passwordHash, $verificationToken]);

$userId = (int) $db->lastInsertId();
$token  = generateToken($userId, $username);

// Send verification email
sendVerificationEmail($email, $username, $verificationToken);

jsonResponse([
    'success' => true,
    'token'   => $token,
    'user'    => [
        'id'       => $userId,
        'username' => $username,
        'email'    => $email,
    ],
], 201);

