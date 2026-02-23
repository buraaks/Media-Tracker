<?php
// !! Bu dosyayi "config.php" olarak kopyalayin ve bilgileri doldurun !!
// Sunucuda public/api/config.php olarak olusturun

if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    http_response_code(403);
    exit;
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'veritabani_adi');
define('DB_USER', 'veritabani_kullanici');
define('DB_PASS', 'veritabani_sifre');

// Guvenlik icin rastgele uzun bir string girin (en az 32 karakter)
define('JWT_SECRET', 'buraya-rastgele-uzun-bir-anahtar-girin-32-karakter-uzunlugunda');
