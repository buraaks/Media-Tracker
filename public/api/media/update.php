<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$auth  = requireAuth();
$input = getInput();

$mediaId  = trim($input['id'] ?? '');
$category = trim($input['category'] ?? '');

if ($mediaId === '') {
    jsonError('ID gerekli.');
}

$notes = $input['notes'] ?? null;

$db = getDB();

$where  = 'user_id = ? AND media_id = ?';
$params = [$auth['user_id'], $mediaId];

if ($category !== '') {
    $where   .= ' AND category = ?';
    $params[] = $category;
}

$stmt = $db->prepare("SELECT id FROM media_items WHERE $where");
$stmt->execute($params);
if (!$stmt->fetch()) {
    jsonError('Icerik bulunamadi.', 404);
}

$stmt = $db->prepare("UPDATE media_items SET notes = ? WHERE $where");
$stmt->execute(array_merge([$notes], $params));

jsonResponse(['success' => true, 'message' => 'Guncellendi.']);
