##Good luck

## 🗄️ Database Schema

주가 예측 머신러닝 서비스의 게시판 기능을 위한 데이터베이스 구조입니다.
`MySQL 8.0+` 환경에 최적화되어 있으며, 외래키(Foreign Key)를 통해 데이터 무결성을 보장합니다.

### 1. ERD 구조 요약

- **users**: 사용자 정보 (기존 테이블 사용)
- **boards**: 게시판 분류 (자유게시판 및 종목별 게시판)
- **posts**: 게시글 (작성자 및 게시판 참조)
- **comments**: 댓글 및 대댓글 (자기 참조 구조를 통한 계층형 댓글 구현)

### 2. 테이블 생성 스크립트 (DDL)

```sql
-- 기존 테이블 삭제 (순서 중요: 자식 테이블부터 삭제)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS boards;

-- 1. 게시판 분류 테이블
CREATE TABLE boards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(20) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- 2. 게시물 테이블
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    board_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_post_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. 댓글 및 대댓글 테이블
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT DEFAULT NULL, -- NULL이면 댓글, ID값이 있으면 해당 댓글의 대댓글
    content TEXT NOT NULL,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```
