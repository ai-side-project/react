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


-- 카테고리 초기 데이터 삽입
INSERT INTO categories (category_sn, name, parent_sn, depth, path) VALUES
-- Level 1: 대분류
('Ca0o2d4', 'Culture', NULL, 1, 'Culture'),
('Cu8e6t5', 'Shopping', NULL, 1, 'Shopping'),
('Ch4v8z7', 'Accommodations', NULL, 1, 'Accommodations'),
('Ca1z6p7', 'History', NULL, 1, 'History'),
('Cl9s3y9', 'Cuisine', NULL, 1, 'Cuisine'),
('Co6c2n2', 'Nature', NULL, 1, 'Nature'),
('Cc9i5o2', 'Experience Programs', NULL, 1, 'Experience Programs'),
('Cv7s8m5', 'Festivals/Events/Performances', NULL, 1, 'Festivals/Events/Performances'),

-- Level 2: 중분류 (Culture 하위)
('Ce9z7g9', 'Parks', 'Ca0o2d4', 2, 'Culture > Parks'),
('Ca1u7i6', 'Cultural Districts', 'Ca0o2d4', 2, 'Culture > Cultural Districts'),
('Cr1f0k2', 'Performance Halls', 'Ca0o2d4', 2, 'Culture > Performance Halls'),
('Cl5y4k0', 'Landmarks', 'Ca0o2d4', 2, 'Culture > Landmarks'),
('Ct4h4b7', 'Other Cultural Destinations', 'Ca0o2d4', 2, 'Culture > Other Cultural Destinations'),
('Co0g3x0', 'Leisure/Sports Centers', 'Ca0o2d4', 2, 'Culture > Leisure/Sports Centers'),
('Cl2d2s1', 'Education Centers', 'Ca0o2d4', 2, 'Culture > Education Centers'),
('Cy5h2x9', 'Theme Parks', 'Ca0o2d4', 2, 'Culture > Theme Parks'),
('Cp7e6o3', 'Convention Centers', 'Ca0o2d4', 2, 'Culture > Convention Centers'),
('Cg1x6l1', 'Cultural Facilities', 'Ca0o2d4', 2, 'Culture > Cultural Facilities'),

-- Level 2: 중분류 (Shopping 하위)
('Cn0t1e0', 'Specialty Shops & Stores', 'Cu8e6t5', 2, 'Shopping > Specialty Shops & Stores'),
('Cy4k5t1', 'Shopping Malls & Outlets', 'Cu8e6t5', 2, 'Shopping > Shopping Malls & Outlets'),
('Cn7z1h7', 'Traditional Markets', 'Cu8e6t5', 2, 'Shopping > Traditional Markets'),
('Cs3j7y4', 'Department Stores', 'Cu8e6t5', 2, 'Shopping > Department Stores'),
('Cp5i3g2', 'Duty Free Shops', 'Cu8e6t5', 2, 'Shopping > Duty Free Shops'),
('Ct1z4k9', 'Supermarkets & Warehouses', 'Cu8e6t5', 2, 'Shopping > Supermarkets & Warehouses'),

-- Level 3: 소분류 (Cultural Facilities 하위)
('Cy6j7j7', 'Others Cultural Facilities', 'Cg1x6l1', 3, 'Culture > Cultural Facilities > Others Cultural Facilities'),
('Ct9t6m8', 'Art Museums/Galleries', 'Cg1x6l1', 3, 'Culture > Cultural Facilities > Art Museums/Galleries'),
('Cr0q2v2', 'Museums', 'Cg1x6l1', 3, 'Culture > Cultural Facilities > Museums'),

-- Level 2: 중분류 (History 하위)
('Cw1i3e4', 'Religious Sites', 'Ca1z6p7', 2, 'History > Religious Sites'),
('Cl1k5b1', 'Historical Sites', 'Ca1z6p7', 2, 'History > Historical Sites'),

-- Level 3: 소분류 (Historical Sites 하위)
('Ch5t7s7', 'Palaces', 'Cl1k5b1', 3, 'History > Historical Sites > Palaces'),
('Cb9c5i3', 'Tombs & Mausoleums', 'Cl1k5b1', 3, 'History > Historical Sites > Tombs & Mausoleums'),
('Ci7i9i6', 'Modern Architecture', 'Cl1k5b1', 3, 'History > Historical Sites > Modern Architecture'),
('Cr6m1i5', 'Others Historical Sites', 'Cl1k5b1', 3, 'History > Historical Sites > Others Historical Sites'),
('Cb9o5c4', 'Historical Sites', 'Cl1k5b1', 3, 'History > Historical Sites > Historical Sites'),
('Co2n1h7', 'Fortresses & Gates', 'Cl1k5b1', 3, 'History > Historical Sites > Fortresses & Gates');