-- 1. DB 생성 및 선택
SET NAMES 'utf8mb4';
CREATE DATABASE IF NOT EXISTS side_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE side_project;

-- 2. 기존 테이블 삭제 (제약 조건 때문에 역순 삭제)[cite: 9]
DROP TABLE IF EXISTS schedule_items;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS place_category_mapping;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS place_images;
DROP TABLE IF EXISTS place_reviews;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS boards;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS rag_files;
-- 3. 유저 및 게시판
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE boards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(20) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- 4. 장소 테이블 (기존에서 확장)
CREATE TABLE places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cid VARCHAR(50) UNIQUE NOT NULL,             -- 콘텐츠 고유 ID
    post_type VARCHAR(50),                       -- 포스트 타입 (JSON에는 없으나 분류용)
    name VARCHAR(200) NOT NULL,                  -- 장소명 (name)
    summary TEXT,                                -- 요약 (summary)
    description LONGTEXT,                        -- 상세 설명 (description)
    
    -- 날짜 정보
    start_date DATE,                             -- 행사 시작일
    end_date DATE,                               -- 행사 종료일
    api_created_at VARCHAR(20),                  -- [추가] API 생성일 (created_at)
    api_updated_at VARCHAR(20),                  -- API 수정일 (updated_at)
    
    -- 주소 및 위치
    address VARCHAR(255),                        -- 구 주소 (address_old)
    address_detail VARCHAR(255),                 -- 상세 주소 (address_detail)
    new_address VARCHAR(255),                    -- 도로명 주소 (address_new)
    zip_code VARCHAR(10),                        -- [추가] 우편번호 (zip_code)
    latitude DECIMAL(11, 8),                     -- 위도
    longitude DECIMAL(11, 8),                    -- 경도
    traffic_info_subway TEXT,                    -- 지하철 정보 (subway_info)
    
    -- 연락처 및 웹사이트
    telephone VARCHAR(100),                      -- 전화번호
    website VARCHAR(500),                        -- 홈페이지
    website_lang JSON,                           -- [추가] 지원 언어 (website_lang)
    
    -- 이용 정보
    opening_hours TEXT,                          -- 이용시간 (use_time)
    closed_days TEXT,                            -- 휴무일
    business_days VARCHAR(100),                  -- [추가] 영업일 (business_days)
    is_free_code CHAR(1),                        -- 유/무료 코드 (fee_type: F/C)
    usage_fee TEXT,                              -- 요금 상세 (fee_guidance)
    important_notes TEXT,                        -- 유의사항 (important_info)
    disabled_facility JSON,                      -- 장애인 시설 (disabled_facilities)
    
    -- 미디어 및 매핑
    images JSON,                                 -- 상세 이미지 배열 (relate_images)
    main_image VARCHAR(500),                     -- 대표 이미지 (main_image)
    tags JSON,                                   -- 태그 (tags)
    category_path_ko VARCHAR(255),               -- [추가] 한글 경로 (category_path)
    last_category_sn VARCHAR(50),                -- [추가] 카테고리 코드 (last_category_sn)
    
    -- 관리용
    status TINYINT(1) DEFAULT 1,
    is_indexed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX (last_category_sn),                    -- [중요] 카테고리 조회 성능 향상
    INDEX (status, end_date),
    INDEX (name)
) ENGINE=InnoDB;

-- 5. 카테고리 테이블 (한글 컬럼 추가)[cite: 7, 9]
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_sn VARCHAR(50) UNIQUE NOT NULL,     -- 카테고리 코드 (Ca0o2d4 등)
    name VARCHAR(100) NOT NULL,                  -- 영문 카테고리명
    name_ko VARCHAR(100),                        -- [보완] 한글 카테고리명
    path VARCHAR(255),                           -- 영문 경로
    path_ko VARCHAR(255),                        -- [보완] 한글 경로
    depth TINYINT NOT NULL,
    parent_sn VARCHAR(50)
) ENGINE=InnoDB;


CREATE TABLE place_category_mapping (
    place_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (place_id, category_id),
    CONSTRAINT fk_mapping_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    CONSTRAINT fk_mapping_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. place_images (신규 추가: 장소별 이미지 관리)
CREATE TABLE place_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_main TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_image_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. place_reviews (신규 추가: 챗봇 학습용으로 좋음)
CREATE TABLE place_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 8. 유저 즐겨찾기 테이블
CREATE TABLE user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    place_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_place (user_id, place_id) -- 중복 즐겨찾기 방지
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
-- 10. 스케줄 아이템 테이블 (장소 방문 일정 관리)
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

-- 11. RAG 파일 관리
CREATE TABLE rag_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    file_type VARCHAR(50),
    chunks INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (category_sn, name, name_ko, depth, path, path_ko, parent_sn) VALUES
-- [Level 1] 대분류: 실제 경로의 시작점 (8개)
('Ca1z6p7', 'History', '역사관광', 1, 'History', '역사관광', NULL), -- 이미지 image_1bc160.png 일치 확인
('Ca0o2d4', 'Culture', '문화관광', 1, 'Culture', '문화관광', NULL), -- 데이터_5.json 일치 확인
('Cl9s3y9', 'Cuisine', '음식', 1, 'Cuisine', '음식', NULL),
('Cu8e6t5', 'Shopping', '쇼핑', 1, 'Shopping', '쇼핑', NULL),
('Co6c2n2', 'Nature', '자연', 1, 'Nature', '자연', NULL),
('Ch4v8z7', 'Accommodations', '숙박', 1, 'Accommodations', '숙박', NULL),
('Cc9i5o2', 'Experience Programs', '체험 프로그램', 1, 'Experience Programs', '체험 프로그램', NULL),
('Cv7s8m5', 'Festivals/Events/Performances', '축제/행사/공연', 1, 'Festivals/Events/Performances', '축제/행사/공연', NULL),

-- [Level 2] 역사관광 하위 (2개)
('Cl1k5b1', 'Historical Sites', '역사유적지', 2, 'History > Historical Sites', '역사관광 > 역사유적지', 'Ca1z6p7'), -- 이미지 일치 확인
('Cw1i3e4', 'Religious Sites', '종교명소', 2, 'History > Religious Sites', '역사관광 > 종교명소', 'Ca1z6p7'),

-- [Level 2] 문화관광 하위 (10개)
('Ce9z7g9', 'Parks', '공원', 2, 'Culture > Parks', '문화관광 > 공원', 'Ca0o2d4'),
('Ca1u7i6', 'Cultural Districts', '문화지구', 2, 'Culture > Cultural Districts', '문화관광 > 문화지구', 'Ca0o2d4'),
('Cr1f0k2', 'Performance Halls', '공연시설', 2, 'Culture > Performance Halls', '문화관광 > 공연시설', 'Ca0o2d4'),
('Cl5y4k0', 'Landmarks', '랜드마크관광', 2, 'Culture > Landmarks', '문화관광 > 랜드마크관광', 'Ca0o2d4'),
('Ct4h4b7', 'Other Cultural Destinations', '기타문화관광지', 2, 'Culture > Other Cultural Destinations', '문화관광 > 기타문화관광지', 'Ca0o2d4'),
('Co0g3x0', 'Leisure/Sports Centers', '레저스포츠시설', 2, 'Culture > Leisure/Sports Centers', '문화관광 > 레저스포츠시설', 'Ca0o2d4'),
('Cl2d2s1', 'Education Centers', '교육시설', 2, 'Culture > Education Centers', '문화관광 > 교육시설', 'Ca0o2d4'),
('Cy5h2x9', 'Theme Parks', '테마파크', 2, 'Culture > Theme Parks', '문화관광 > 테마파크', 'Ca0o2d4'),
('Cp7e6o3', 'Convention Centers', '컨벤션센터', 2, 'Culture > Convention Centers', '문화관광 > 컨벤션센터', 'Ca0o2d4'),
('Cg1x6l1', 'Cultural Facilities', '전시시설', 2, 'Culture > Cultural Facilities', '문화관광 > 전시시설', 'Ca0o2d4'), -- 전통공예명품전 데이터 일치[cite: 6]

-- [Level 2] 쇼핑 하위 (6개)
('Cn0t1e0', 'Specialty Shops', '전문상점', 2, 'Shopping > Specialty Shops', '쇼핑 > 전문상점', 'Cu8e6t5'),
('Cy4k5t1', 'Malls', '쇼핑몰/아울렛', 2, 'Shopping > Shopping Malls', '쇼핑 > 쇼핑몰/아울렛', 'Cu8e6t5'),
('Cn7z1h7', 'Traditional Markets', '전통시장', 2, 'Shopping > Traditional Markets', '쇼핑 > 전통시장', 'Cu8e6t5'),
('Cs3j7y4', 'Department Stores', '백화점', 2, 'Shopping > Department Stores', '쇼핑 > 백화점', 'Cu8e6t5'),
('Cp5i3g2', 'Duty Free Shops', '면세점', 2, 'Shopping > Duty Free Shops', '쇼핑 > 면세점', 'Cu8e6t5'),
('Ct1z4k9', 'Supermarkets', '대형마트/물류센터', 2, 'Shopping > Supermarkets', '쇼핑 > 대형마트/물류센터', 'Cu8e6t5'),

-- [Level 2] 숙박 하위 (2개)
('Ce7q5s7', 'Hotels', '호텔', 2, 'Accommodations > Hotels', '숙박 > 호텔', 'Ch4v8z7'),
('Ct9n1n3', 'Hostels', '호스텔/게스트하우스', 2, 'Accommodations > Hostels', '숙박 > 호스텔/게스트하우스', 'Ch4v8z7'),

-- [Level 2] 음식 하위 (4개)
('Cz9d1h6', 'Korean Restaurants', '한식', 2, 'Cuisine > Korean Restaurants', '음식 > 한식', 'Cl9s3y9'),
('Cx0t8m5', 'Cafes & Tea Shops', '카페/전통찻집', 2, 'Cuisine > Cafes & Tea Shops', '음식 > 카페/전통찻집', 'Cl9s3y9'), -- 월하보이 데이터 일치 확인[cite: 6]
('Ck6n0w6', 'Bars & Clubs', '바/클럽', 2, 'Cuisine > Bars & Clubs', '음식 > 바/클럽', 'Cl9s3y9'),
('Cx2j0n1', 'Foreign Restaurant', '외국음식점', 2, 'Cuisine > Foreign Restaurant', '음식 > 외국음식점', 'Cl9s3y9'),

-- [Level 2] 자연 하위 (3개)
('Cu5u8d4', 'Mountains', '자연명소(산)', 2, 'Nature > Mountains', '자연 > 자연명소(산)', 'Co6c2n2'),
('Cw8j0y7', 'Rivers', '자연명소(강/바다)', 2, 'Nature > Rivers', '자연 > 자연명소(강/바다)', 'Co6c2n2'),
('Cp3b3j9', 'Parks(Nature)', '자연명소(공원)', 2, 'Nature > Parks', '자연 > 자연명소(공원)', 'Co6c2n2'),

-- [Level 2] 체험 하위 (6개)
('Cr6o1h2', 'Industrial Sites', '산업관광', 2, 'Experience > Industrial Sites', '체험 프로그램 > 산업관광', 'Cc9i5o2'),
('Cq3m6s6', 'Craft Workshops', '공예체험', 2, 'Experience > Craft Workshops', '체험 프로그램 > 공예체험', 'Cc9i5o2'),
('Cd0m9o0', 'Traditional Experience', '전통체험', 2, 'Experience > Traditional Experience', '체험 프로그램 > 전통체험', 'Cc9i5o2'),
('Cl8f8q1', 'Other Experiences', '기타체험', 2, 'Experience > Other Experiences', '체험 프로그램 > 기타체험', 'Cc9i5o2'),
('Cf1y9k1', 'Wellness', '웰니스', 2, 'Experience > Wellness', '체험 프로그램 > 웰니스', 'Cc9i5o2'),
('Cq9d5v0', 'Temple Stays', '템플스테이', 2, 'Experience > Temple Stays', '체험 프로그램 > 템플스테이', 'Cc9i5o2'),

-- [Level 2] 축제/공연 하위 (3개)
('Cd4y5u1', 'Festivals', '축제', 2, 'Festivals > Festivals', '축제/행사/공연 > 축제', 'Cv7s8m5'),
('Cb2b0t2', 'Performances', '공연', 2, 'Festivals > Performances', '축제/행사/공연 > 공연', 'Cv7s8m5'),
('Cf9q1q4', 'Events', '이벤트', 2, 'Festivals > Events', '축제/행사/공연 > 이벤트', 'Cv7s8m5'),

-- [Level 3] 소분류 (17개)
('Cy6j7j7', 'Others(Cultural)', '기타 전시시설', 3, 'Culture > Facilities > Others', '문화관광 > 전시시설 > 기타 전시시설', 'Cg1x6l1'),
('Ct9t6m8', 'Art Museums', '미술관/화랑', 3, 'Culture > Facilities > Art', '문화관광 > 전시시설 > 미술관/화랑', 'Cg1x6l1'), -- 간송미술관 데이터 일치[cite: 6]
('Cr0q2v2', 'Museums', '박물관', 3, 'Culture > Facilities > Museums', '문화관광 > 전시시설 > 박물관', 'Cg1x6l1'),
('Ch5t7s7', 'Palaces', '고궁', 3, 'History > Sites > Palaces', '역사관광 > 역사유적지 > 고궁', 'Cl1k5b1'),
('Cb9c5i3', 'Tombs', '고분/묘역', 3, 'History > Sites > Tombs', '역사관광 > 역사유적지 > 고분/묘역', 'Cl1k5b1'),
('Ci7i9i6', 'Modern Arch', '근대건축', 3, 'History > Sites > Modern', '역사관광 > 역사유적지 > 근대건축', 'Cl1k5b1'),
('Cr6m1i5', 'Others(Hist)', '기타 역사유적지', 3, 'History > Sites > Others', '역사관광 > 역사유적지 > 기타 역사유적지', 'Cl1k5b1'),
('Cb9o5c4', 'Historical Sites Detail', '유적지상세', 3, 'History > Sites > Detail', '역사관광 > 역사유적지 > 유적지상세', 'Cl1k5b1'),
('Co2n1h7', 'Gates', '성곽/성문', 3, 'History > Sites > Gates', '역사관광 > 역사유적지 > 성곽/성문', 'Cl1k5b1'),
('Cn7k2s5', 'Others(Foreign)', '기타 외국음식', 3, 'Cuisine > Foreign > Others', '음식 > 외국음식점 > 기타 외국음식', 'Cx2j0n1'),
('Cl9n1c2', 'Western', '양식', 3, 'Cuisine > Foreign > Western', '음식 > 외국음식점 > 양식', 'Cx2j0n1'),
('Ch7l5i4', 'Japanese', '일식', 3, 'Cuisine > Foreign > Japanese', '음식 > 외국음식점 > 일식', 'Cx2j0n1'),
('Cm1y8v1', 'Chinese', '중식', 3, 'Cuisine > Foreign > Chinese', '음식 > 외국음식점 > 중식', 'Cx2j0n1'),
('Cx3e9k9', 'Fusion', '퓨전', 3, 'Cuisine > Foreign > Fusion', '음식 > 외국음식점 > 퓨전', 'Cx2j0n1'),
('Cw7q1x8', 'Others(Events)', '기타 행사', 3, 'Festivals > Events > Others', '축제/행사/공연 > 이벤트 > 기타 행사', 'Cf9q1q4'),
('Cu6j1f4', 'Expos', '박람회', 3, 'Festivals > Events > Expos', '축제/행사/공연 > 이벤트 > 박람회', 'Cf9q1q4'),
('Cu9u5z7', 'Exhibitions', '전시회', 3, 'Festivals > Events > Exhibitions', '축제/행사/공연 > 이벤트 > 전시회', 'Cf9q1q4');