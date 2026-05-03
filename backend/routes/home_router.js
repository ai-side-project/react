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
    p.id,
    p.cid,
    p.name,
    p.summary,
    p.description,
    p.address,
    p.new_address AS road_address,
    p.latitude,
    p.longitude,
    p.telephone,
    p.website,
    p.opening_hours,
    NULL AS operating_days,
    p.closed_days,
    p.usage_fee,
    p.images,
    p.traffic_info_subway,
    NULL AS traffic_info_bus,
    p.disabled_facility,
    p.tags,
    pi.image_url AS main_image_url
  FROM places p
  LEFT JOIN place_images pi
    ON p.id = pi.place_id
    AND pi.is_main = 1
  WHERE
    p.name LIKE ?
    OR p.summary LIKE ?
    OR p.description LIKE ?
    OR p.address LIKE ?
    OR p.new_address LIKE ?
  ORDER BY p.id DESC
  `,
      [
        searchKeyword,
        searchKeyword,
        searchKeyword,
        searchKeyword,
        searchKeyword,
      ],
    );

    res.json(rows);
  } catch (error) {
    console.error("홈 장소 검색 오류:", error);
    res.status(500).json({ message: "장소 검색 중 오류가 발생했습니다." });
  }
});

router.get("/category", async (req, res) => {
  const category = req.query.category || "";

  if (!category.trim()) {
    return res.json([]);
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.cid,
        p.post_type,
        p.name,
        p.summary,
        p.description,
        p.start_date,
        p.end_date,
        p.address,
        p.address_detail,
        p.new_address AS road_address,
        p.latitude,
        p.longitude,
        p.telephone,
        p.website,
        p.opening_hours,
        NULL AS operating_days,
        p.closed_days,
        p.is_free_code,
        p.usage_fee,
        p.important_notes,
        p.images,
        p.traffic_info_subway,
        NULL AS traffic_info_bus,
        p.disabled_facility,
        p.tags,
        p.status,
        pi.image_url AS main_image_url
      FROM places p
      JOIN place_category_mapping pcm
        ON p.id = pcm.place_id
      JOIN categories c
        ON pcm.category_id = c.id
      LEFT JOIN place_images pi
        ON p.id = pi.place_id
        AND pi.is_main = 1
      WHERE c.name = ?
      ORDER BY p.id DESC
      `,
      [category.trim()],
    );

    res.json(rows);
  } catch (error) {
    console.error("홈 카테고리 검색 오류:", error);
    res.status(500).json({ message: "카테고리 검색 중 오류가 발생했습니다." });
  }
});

router.get("/places/:id", async (req, res) => {
  const placeId = req.params.id;

  try {
    const [placeRows] = await pool.query(
      `
  SELECT
    id,
    cid,
    name,
    summary,
    description,
    address,
    new_address AS road_address,
    latitude,
    longitude,
    telephone,
    website,
    opening_hours,
    NULL AS operating_days,
    closed_days,
    usage_fee,
    images,
    traffic_info_subway,
    NULL AS traffic_info_bus,
    disabled_facility,
    tags
  FROM places
  WHERE id = ?
  `,
      [placeId],
    );

    if (placeRows.length === 0) {
      return res.status(404).json({ message: "장소를 찾을 수 없습니다." });
    }

    const [imageRows] = await pool.query(
      `
      SELECT
        id,
        image_url,
        is_main,
      FROM place_images
      WHERE place_id = ?
      ORDER BY is_main DESC, id ASC
      `,
      [placeId],
    );

    res.json({
      place: placeRows[0],
      images: imageRows,
    });
  } catch (error) {
    console.error("장소 상세 조회 오류:", error);
    res.status(500).json({ message: "장소 상세 조회 중 오류가 발생했습니다." });
  }
});

module.exports = router;
