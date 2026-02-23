<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$input    = getInput();
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if ($username === '' || $password === '') {
    jsonError('Kullanici adi ve sifre gerekli.');
}

$db   = getDB();
$stmt = $db->prepare('SELECT id, username, email, password_hash FROM users WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonError('Kullanici adi veya sifre hatali.', 401);
}

$token = generateToken((int) $user['id'], $user['username']);

jsonResponse([
    'success' => true,
    'token'   => $token,
    'user'    => [
        'id'       => (int) $user['id'],
        'username' => $user['username'],
        'email'    => $user['email'],
    ],
]);
