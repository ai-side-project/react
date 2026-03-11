const express = require("express")
const pool = require("../db/db") // ★ db.js (커넥션 풀) 불러오기
const router = express.Router()

// ==================== 인증 미들웨어 ====================
// 로그인 여부 확인 함수
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.status(401).json({ error: "로그인이 필요합니다." })
}

// ==================== 게시글 목록 조회 ====================
// GET /api/posts/
router.get("/", async (req, res) => {
  try {
    // 작성자(users) 테이블과 조인하여 닉네임도 같이 가져옵니다.
    const sql = `
      SELECT p.*, u.nickname 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.createdAt DESC
    `
    const [posts] = await pool.query(sql)

    return res.status(200).json(posts)
  } catch (err) {
    console.error("게시글 목록 조회 오류:", err)
    return res.status(500).json({ error: "서버 오류" })
  }
})

// ==================== 게시글 상세 조회 (선택 사항) ====================
// GET /api/posts/:id
router.get("/:id", async (req, res) => {
  const postId = req.params.id
  try {
    const sql = `
      SELECT p.*, u.nickname 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `
    const [rows] = await pool.query(sql, [postId])

    if (rows.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." })
    }

    return res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "서버 오류" })
  }
})

// ==================== 게시글 작성 ====================
// POST /api/posts/
router.post("/", requireAuth, async (req, res) => {
  const { title, content } = req.body
  const userId = req.user.id // Passport 세션에서 가져온 유저 ID

  console.log(`게시글 작성 요청 - UserID: ${userId}, Title: ${title}`)

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "제목을 입력해주세요." })
  }

  try {
    // 1. 게시글 INSERT
    const insertSql =
      "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)"
    const [result] = await pool.query(insertSql, [title, content, userId])

    // 2. 방금 생성된 게시글 정보 다시 조회 (프론트엔드 반환용)
    const newPostId = result.insertId
    const selectSql = `
      SELECT p.*, u.nickname 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `
    const [rows] = await pool.query(selectSql, [newPostId])

    return res.status(201).json(rows[0])
  } catch (err) {
    console.error("게시글 작성 오류:", err)
    return res.status(500).json({ error: "서버 오류" })
  }
})

// ==================== 게시글 삭제 ====================
// DELETE /api/posts/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const postId = Number(req.params.id)
  const userId = req.user.id // 로그인한 유저 ID

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "유효하지 않은 게시글 ID입니다." })
  }

  try {
    // 1. 게시글 존재 여부 및 작성자 확인
    const checkSql = "SELECT user_id FROM posts WHERE id = ?"
    const [rows] = await pool.query(checkSql, [postId])

    if (rows.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." })
    }

    const postOwnerId = rows[0].user_id

    // 2. 작성자 본인인지 확인
    if (postOwnerId !== userId) {
      return res
        .status(403)
        .json({ error: "본인이 작성한 게시글만 삭제할 수 있습니다." })
    }

    // 3. 삭제 실행
    const deleteSql = "DELETE FROM posts WHERE id = ?"
    await pool.query(deleteSql, [postId])

    return res.json({ success: true, message: "게시글이 삭제되었습니다." })
  } catch (err) {
    console.error("게시글 삭제 오류:", err)
    return res.status(500).json({ error: "서버 오류" })
  }
})

module.exports = router
