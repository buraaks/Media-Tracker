<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$input      = getInput();
$credential = trim($input['credential'] ?? '');

if ($credential === '') {
    jsonError('Google token gerekli.');
}

$ch = curl_init('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    jsonError('Gecersiz Google token.', 401);
}

$googleData = json_decode($response, true);

if (!isset($googleData['sub'], $googleData['email'])) {
    jsonError('Google token dogrulanamadi.', 401);
}

// Ensure client ID matches if defined in config.php
if (defined('GOOGLE_CLIENT_ID') && GOOGLE_CLIENT_ID !== 'your_google_client_id_here' && $googleData['aud'] !== GOOGLE_CLIENT_ID) {
    jsonError('Google Client ID uyusmazligi.', 401);
}

$googleId = $googleData['sub'];
$email    = $googleData['email'];
$name     = $googleData['name'] ?? explode('@', $email)[0];

$db = getDB();

$stmt = $db->prepare('SELECT id, username, email, email_verified FROM users WHERE google_id = ?');
$stmt->execute([$googleId]);
$user = $stmt->fetch();

if (!$user) {
    $stmt = $db->prepare('SELECT id, username, email, email_verified FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $db->prepare('UPDATE users SET google_id = ?, email_verified = 1 WHERE id = ?');
        $stmt->execute([$googleId, $user['id']]);
    } else {
        $usernameBase = preg_replace('/[^a-zA-Z0-9_]/', '', strtolower(str_replace(' ', '_', $name)));
        $username     = $usernameBase;
        $counter      = 1;

        while (true) {
            $stmt = $db->prepare('SELECT id FROM users WHERE username = ?');
            $stmt->execute([$username]);
            if (!$stmt->fetch()) {
                break;
            }
            $username = $usernameBase . $counter;
            $counter++;
        }

        $password = $input['password'] ?? '';
        
        if ($password === '') {
            jsonResponse([
                'success' => false,
                'require_password' => true,
                'message' => 'Hesabınızı oluşturmak için lütfen bir şifre belirleyin.'
            ]);
        }

        if (strlen($password) < 6) {
            jsonError('Şifre en az 6 karakter olmalıdır.');
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $db->prepare('INSERT INTO users (username, email, email_verified, google_id, password_hash) VALUES (?, ?, 1, ?, ?)');
        $stmt->execute([$username, $email, $googleId, $passwordHash]);

        $userId = (int) $db->lastInsertId();
        $user   = [
            'id'             => $userId,
            'username'       => $username,
            'email'          => $email,
            'email_verified' => 1,
        ];
    } else {
        $user['email_verified'] = 1;
    }
}

$token = generateToken((int) $user['id'], $user['username']);

jsonResponse([
    'success' => true,
    'token'   => $token,
    'user'    => [
        'id'             => (int) $user['id'],
        'username'       => $user['username'],
        'email'          => $user['email'],
        'email_verified' => (bool) $user['email_verified'],
    ],
]);
