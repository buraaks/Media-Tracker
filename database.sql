-- Media Tracker - Veritabani Semasi
-- phpMyAdmin SQL sekmesinde bu kodlari calistirin

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE media_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    media_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    year VARCHAR(20) DEFAULT '-',
    score VARCHAR(20) DEFAULT '-',
    image VARCHAR(500) DEFAULT '',
    extra TEXT,
    category ENUM('film', 'dizi', 'anime', 'manga') NOT NULL,
    plot TEXT,
    genre VARCHAR(255),
    added_at BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_media (user_id, media_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
