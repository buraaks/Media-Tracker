<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

$auth     = requireAuth();
$category = $_GET['category'] ?? null;
$db       = getDB();

if ($category) {
    $allowed = ['film', 'dizi', 'anime', 'manga'];
    if (!in_array($category, $allowed, true)) {
        jsonError('Gecersiz kategori.');
    }
    $stmt = $db->prepare('SELECT * FROM media_items WHERE user_id = ? AND category = ? ORDER BY added_at DESC');
    $stmt->execute([$auth['user_id'], $category]);
} else {
    $stmt = $db->prepare('SELECT * FROM media_items WHERE user_id = ? ORDER BY added_at DESC');
    $stmt->execute([$auth['user_id']]);
}

$rows   = $stmt->fetchAll();
$result = array_map(function ($row) {
    return [
        'id'       => $row['media_id'],
        'title'    => $row['title'],
        'year'     => $row['year'],
        'score'    => $row['score'],
        'image'    => $row['image'],
        'extra'    => $row['extra'],
        'category' => $row['category'],
        'plot'     => $row['plot'],
        'genre'    => $row['genre'],
        'addedAt'  => (int) $row['added_at'],
    ];
}, $rows);

jsonResponse(['success' => true, 'items' => $result]);
