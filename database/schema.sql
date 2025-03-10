-- 创建数据库
CREATE DATABASE IF NOT EXISTS mahjong_prediction;

-- 使用数据库
USE mahjong_prediction;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_fingerprint VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_fingerprint (device_fingerprint)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建每日运势表
CREATE TABLE IF NOT EXISTS daily_fortunes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    lunar_date VARCHAR(20) NOT NULL,
    chinese_zodiac VARCHAR(10) NOT NULL,
    star_sign VARCHAR(20) NOT NULL,
    lucky_direction VARCHAR(10) NOT NULL,
    lucky_number INT NOT NULL,
    good_for JSON NOT NULL,
    bad_for JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建预测结果表
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    gender ENUM('male', 'female') NOT NULL DEFAULT 'male',
    birthdate DATETIME NOT NULL,
    province VARCHAR(20) NOT NULL,
    city VARCHAR(20) NOT NULL,
    district VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    lucky_number INT NOT NULL,
    lucky_color VARCHAR(20) NOT NULL,
    lucky_item VARCHAR(50) NOT NULL,
    advice TEXT NOT NULL,
    prediction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建历史记录表
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    prediction_id INT NOT NULL,
    prediction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (prediction_id) REFERENCES predictions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 