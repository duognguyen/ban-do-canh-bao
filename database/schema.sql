-- Schema chuẩn của dự án (khớp với CSDL đang chạy).
-- users.status CHỈ nhận 'active' | 'blocked' (không dùng 0/1).

CREATE DATABASE IF NOT EXISTS `traffic_map_db`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `traffic_map_db`;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin') DEFAULT 'user',
    `status` ENUM('active', 'blocked') DEFAULT 'active',
    `reputation_score` INT DEFAULT 10, -- Điểm uy tín (trừ điểm nếu báo tin giả)
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `reports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `type` ENUM('ngap_nuoc', 'ket_xe') NOT NULL,
    `severity` ENUM('nhe', 'vua', 'nghiem_trong') DEFAULT 'vua',

    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `address_text` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(255) NULL,

    `confirm_count` INT DEFAULT 1,
    `reject_count` INT DEFAULT 0,

    `status` ENUM('dang_dien_ra', 'da_ket_thuc', 'bi_an') DEFAULT 'dang_dien_ra',
    `expires_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `report_votes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `report_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `vote_type` ENUM('confirm', 'reject') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `fk_votes_report` FOREIGN KEY (`report_id`)
        REFERENCES `reports`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_votes_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE,

    UNIQUE KEY `unique_user_report_vote` (`report_id`, `user_id`)
) ENGINE=InnoDB;

