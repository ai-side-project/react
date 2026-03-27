-- 1. DB 생성 및 선택
CREATE DATABASE IF NOT EXISTS side_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE side_project;

-- 2. 기존 테이블 삭제 (초기화용)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS boards;

-- 3. 유저 테이블 (이미 있다면 생성 건너뜀)
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 4. 게시판 분류 테이블
CREATE TABLE boards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(20) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- 5. 게시물 테이블
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    board_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_post_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. 댓글 및 대댓글 테이블
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    content TEXT NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. 초기 게시판 데이터 삽입
INSERT INTO boards (name, slug) VALUES 
('자유게시판', 'free'),
('삼성전자', 'samsung'),
('SK하이닉스', 'skhynix'),
('카카오', 'kakao');