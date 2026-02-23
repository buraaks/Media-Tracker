<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$auth    = requireAuth();
$input   = getInput();
$mediaId = trim($input['id'] ?? '');

if ($mediaId === '') {
    jsonError('ID gerekli.');
}

$db = getDB();

$where  = 'user_id = ? AND media_id = ?';
$params = [$auth['user_id'], $mediaId];

$category = trim($input['category'] ?? '');
if ($category !== '') {
    $where   .= ' AND category = ?';
    $params[] = $category;
}

$stmt = $db->prepare("DELETE FROM media_items WHERE $where");
$stmt->execute($params);

if ($stmt->rowCount() === 0) {
    jsonError('Icerik bulunamadi.', 404);
}

jsonResponse(['success' => true, 'message' => 'Silindi.']);
