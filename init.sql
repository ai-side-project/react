-- 1. DB 생성 및 선택
SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS side_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE side_project;

-- 2. 기존 테이블 삭제 (외래 키 제약 때문에 역순 삭제)
DROP TABLE IF EXISTS schedule_items;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS place_category_mapping;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS boards;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS rag_files;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 게시판 관련 테이블 (복구)
CREATE TABLE boards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(20) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 관광지 정보 테이블 (비짓서울 API 상세 필드 통합형)
CREATE TABLE places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cid VARCHAR(50) UNIQUE NOT NULL,          -- 비짓서울 고유 ID
    name VARCHAR(200) NOT NULL,               -- post_sj
    summary TEXT,                             -- sumry (요약)
    description LONGTEXT,                     -- post_desc (RAG 핵심 지식)
    
    address VARCHAR(255),                     -- 구 주소
    new_address VARCHAR(255),                 -- 신 주소
    zip_code VARCHAR(20),                     -- 우편번호
    latitude DECIMAL(11, 8),                  -- 위도
    longitude DECIMAL(11, 8),                 -- 경도
    
    telephone VARCHAR(100),                   -- 전화번호
    website VARCHAR(500),                     -- 홈페이지
    opening_hours TEXT,                       -- 이용시간
    closed_days TEXT,                         -- 휴무일
    usage_fee TEXT,                           -- 이용요금
    
    images JSON,                              -- [main_img, relate_imgs...]
    traffic_info_subway TEXT,                 -- 지하철 정보
    disabled_facility JSON,                   -- 장애인 편의시설
    tags JSON,                                -- 태그 리스트
    
    is_indexed TINYINT(1) DEFAULT 0,          -- RAG(ChromaDB) 등록 여부
    api_updated_at VARCHAR(20),               -- API 최종 수정일
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 즐겨찾기 테이블 (복구 및 강화)
-- 유저가 찜한 목록을 가지고 있다가 스케줄에 추가할 때 참조합니다.
CREATE TABLE user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    place_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_place (user_id, place_id) -- 중복 즐겨찾기 방지
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. 카테고리 마스터 테이블
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_sn VARCHAR(50) UNIQUE NOT NULL,  -- com_ctgry_sn
    name VARCHAR(100) NOT NULL,               -- ctgry_nm
    parent_sn VARCHAR(50),                    -- 부모 코드
    depth TINYINT,                            -- 계층 레벨
    path VARCHAR(255)                         -- 전체 경로
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. 관광지-카테고리 매핑 (N:M)
CREATE TABLE place_category_mapping (
    place_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (place_id, category_id),
    CONSTRAINT fk_mapping_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    CONSTRAINT fk_mapping_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. 스케줄 관련 테이블
CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE schedule_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    place_id INT NOT NULL,
    visit_date DATE DEFAULT NULL,
    visit_time TIME DEFAULT NULL,
    visit_order INT DEFAULT 0,
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. RAG 파일 관리
CREATE TABLE rag_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    file_type VARCHAR(50),
    chunks INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);