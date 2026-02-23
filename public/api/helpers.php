<?php
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    http_response_code(403);
    exit;
}

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function corsHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(string $message, int $code = 400): void {
    jsonResponse(['success' => false, 'message' => $message], $code);
}

function getInput(): array {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);
    return is_array($input) ? $input : [];
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateToken(int $userId, string $username): string {
    $payload = json_encode([
        'user_id'  => $userId,
        'username' => $username,
        'exp'      => time() + (7 * 24 * 60 * 60), // 7 gun
    ]);
    $base      = base64url_encode($payload);
    $signature = hash_hmac('sha256', $base, JWT_SECRET);
    return $base . '.' . $signature;
}

function verifyToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;

    $expectedSig = hash_hmac('sha256', $parts[0], JWT_SECRET);
    if (!hash_equals($expectedSig, $parts[1])) return null;

    $payload = json_decode(base64url_decode($parts[0]), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) return null;

    return $payload;
}

function requireAuth(): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        jsonError('Yetkilendirme gerekli.', 401);
    }

    $payload = verifyToken($matches[1]);
    if (!$payload) {
        jsonError('Oturum suresi doldu. Tekrar giris yapin.', 401);
    }

    return $payload;
}
