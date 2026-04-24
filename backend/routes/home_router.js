const express = require("express");
const pool = require("../db/db"); // ★ db.js (커넥션 풀) 불러오기
const router = express.Router();

// ==================== 인증 미들웨어 ====================
// 로그인 여부 확인 함수
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "로그인이 필요합니다." });
}
router.get("/", async (req, res) => {
  res.json({ message: "home api" });
});

router.get("/search", async (req, res) => {
  const keyword = req.query.keyword || "";

  if (!keyword.trim()) {
    return res.json([]);
  }

  try {
    const searchKeyword = `%${keyword.trim()}%`;

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        address,
        road_address,
        latitude,
        longitude,
        telephone,
        website,
        opening_hours,
        operating_days,
        closed_days,
        traffic_info_subway,
        traffic_info_bus
      FROM places
      WHERE
        name LIKE ?
        OR description LIKE ?
        OR address LIKE ?
        OR road_address LIKE ?
      ORDER BY id DESC
      `,
      [searchKeyword, searchKeyword, searchKeyword, searchKeyword],
    );

    res.json(rows);
  } catch (error) {
    console.error("홈 장소 검색 오류:", error);
    res.status(500).json({ message: "장소 검색 중 오류가 발생했습니다." });
  }
});

module.exports = router;
