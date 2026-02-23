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
$title    = trim($input['title'] ?? '');
$category = trim($input['category'] ?? '');

if ($mediaId === '' || $title === '' || $category === '') {
    jsonError('ID, baslik ve kategori gerekli.');
}

$allowed = ['film', 'dizi', 'anime', 'manga'];
if (!in_array($category, $allowed, true)) {
    jsonError('Gecersiz kategori.');
}

$db = getDB();

$stmt = $db->prepare('SELECT id FROM media_items WHERE user_id = ? AND media_id = ? AND category = ?');
$stmt->execute([$auth['user_id'], $mediaId, $category]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'duplicate' => true, 'message' => 'Bu icerik zaten listenizde.'], 409);
    return;
}

$stmt = $db->prepare(
    'INSERT INTO media_items (user_id, media_id, title, year, score, image, extra, category, plot, genre, notes, added_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([
    $auth['user_id'],
    $mediaId,
    $title,
    $input['year'] ?? '-',
    $input['score'] ?? '-',
    $input['image'] ?? '',
    $input['extra'] ?? '',
    $category,
    $input['plot'] ?? null,
    $input['genre'] ?? null,
    $input['notes'] ?? null,
    $input['addedAt'] ?? (int) (microtime(true) * 1000),
]);

jsonResponse(['success' => true, 'message' => 'Eklendi.'], 201);
