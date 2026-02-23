<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$auth  = requireAuth();
$input = getInput();

$mediaId = trim($input['id'] ?? '');
if ($mediaId === '') {
    jsonError('ID gerekli.');
}

$notes = $input['notes'] ?? null;

$db   = getDB();
$stmt = $db->prepare('UPDATE media_items SET notes = ? WHERE user_id = ? AND media_id = ?');
$stmt->execute([$notes, $auth['user_id'], $mediaId]);

if ($stmt->rowCount() === 0) {
    jsonError('Icerik bulunamadi.', 404);
}

jsonResponse(['success' => true, 'message' => 'Guncellendi.']);
