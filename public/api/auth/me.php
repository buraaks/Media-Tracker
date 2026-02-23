<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

$auth = requireAuth();

$db   = getDB();
$stmt = $db->prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
$stmt->execute([$auth['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    jsonError('Kullanici bulunamadi.', 404);
}

jsonResponse([
    'success' => true,
    'user'    => [
        'id'         => (int) $user['id'],
        'username'   => $user['username'],
        'email'      => $user['email'],
        'created_at' => $user['created_at'],
    ],
]);
