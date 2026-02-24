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

function sendVerificationEmail(string $to, string $username, string $token): void {
    $siteUrl    = defined('SITE_URL') ? SITE_URL : '';
    $verifyLink = $siteUrl . '/verify-email?token=' . urlencode($token);
    $from       = defined('MAIL_FROM_ADDRESS') ? MAIL_FROM_ADDRESS : 'noreply@example.com';

    $subject = 'Media Tracker - E-posta Dogrulamasi';

    $body = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #1a1a1a; color: #e0e0e0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #242424; border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.06);">
    <h2 style="margin: 0 0 8px; color: #f0f0f0; font-size: 20px;">Merhaba, {$username}!</h2>
    <p style="color: #999; font-size: 14px; margin: 0 0 24px;">Media Tracker'daki hesabınızı dogrulamak icin 6 haneli kodunuz aşağıdadır.</p>
    <div style="background: #2f2f2f; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; border: 1px dashed rgba(255,255,255,0.2);">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #fff;">{$token}</span>
    </div>
    <p style="color: #666; font-size: 12px; margin: 24px 0 0;">Bu e-postayi siz talep etmediyseniz, guvenlice goz ardi edebilirsiniz.</p>
  </div>
</body>
</html>
HTML;

    $headers  = "From: Media Tracker <{$from}>\r\n";
    $headers .= "Reply-To: {$from}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    @mail($to, $subject, $body, $headers);
}
