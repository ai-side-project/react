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
  if (!keyword.trim()) return res.json([]);

  try {
    const searchKeyword = `%${keyword.trim()}%`;
    const [rows] = await pool.query(
      `SELECT 
        id, name, summary, description, address, new_address, 
        latitude, longitude, telephone, website, opening_hours, 
        business_days, closed_days, traffic_info_subway, main_image
      FROM places
      WHERE 
        name LIKE ? 
        OR summary LIKE ?
        OR description LIKE ? 
        OR address LIKE ? 
        OR new_address LIKE ?
        OR category_path_ko LIKE ?
      ORDER BY id DESC`,
      [
        searchKeyword,
        searchKeyword,
        searchKeyword,
        searchKeyword,
        searchKeyword,
        searchKeyword,
      ],
    );
    res.json(rows);
  } catch (error) {
    console.error("검색 오류:", error);
    res.status(500).json({ message: "검색 중 오류 발생" });
  }
});

// 2. 카테고리 API
router.get("/category", async (req, res) => {
  const category = req.query.category || "";
  if (!category.trim()) return res.json([]);

  try {
    const searchCategory = `%${category.trim()}%`;

    const [rows] = await pool.query(
      `SELECT 
        id, name, summary, description, address, new_address,
        latitude, longitude, telephone, website, opening_hours,
        business_days, closed_days, traffic_info_subway, main_image,
        category_path_ko
      FROM places
      WHERE category_path_ko LIKE ?
      ORDER BY id DESC`,
      [searchCategory],
    );

    res.json(rows);
  } catch (error) {
    console.error("카테고리 오류:", error);
    res.status(500).json({ message: "카테고리 검색 오류" });
  }
});

// 3. 상세 정보 API
router.get("/places/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM places WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "장소 없음" });

    const place = rows[0];

    // JSON 필드 파싱 (images, disabled_facility 등)
    const images =
      typeof place.images === "string"
        ? JSON.parse(place.images)
        : place.images || [];

    res.json({
      place: place,
      images: images.map((img, idx) => ({ id: idx, url: img.url || img })),
    });
  } catch (error) {
    console.error("상세 조회 오류:", error);
    res.status(500).json({ message: "상세조회 오류" });
  }
});

module.exports = router;
