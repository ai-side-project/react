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
router.get("/", async (req, res) => {})
module.exports = router
