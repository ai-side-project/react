const express = require("express");
const router = express.Router();
const pool = require("../db/db");

const getLoginUserId = (req) => {
  return req.user?.id || req.session?.user?.id || req.session?.user?.user_id;
};

// 즐겨찾기 목록 조회
router.get("/", async (req, res) => {
  const userId = getLoginUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "로그인이 필요합니다.",
    });
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
FROM user_favorites uf
JOIN places p
  ON uf.place_id = p.id
LEFT JOIN (
  SELECT
    place_id,
    MIN(image_url) AS image_url
  FROM place_images
  GROUP BY place_id
) pi
  ON p.id = pi.place_id
WHERE uf.user_id = ?
ORDER BY uf.created_at DESC
      `,
      [userId],
    );

    res.json(rows);
  } catch (error) {
    console.error("즐겨찾기 목록 조회 실패:", error);
    res.status(500).json({
      message: "즐겨찾기 목록 조회 실패",
    });
  }
});

// 즐겨찾기 추가
router.post("/:placeId", async (req, res) => {
  const userId = getLoginUserId(req);
  const { placeId } = req.params;

  if (!userId) {
    return res.status(401).json({
      message: "로그인이 필요합니다.",
    });
  }

  try {
    await pool.query(
      `
      INSERT IGNORE INTO user_favorites
      (user_id, place_id)
      VALUES (?, ?)
      `,
      [userId, placeId],
    );

    res.status(201).json({
      message: "즐겨찾기에 추가되었습니다.",
    });
  } catch (error) {
    console.error("즐겨찾기 추가 실패:", error);
    res.status(500).json({
      message: "즐겨찾기 추가 실패",
    });
  }
});

// 즐겨찾기 삭제
router.delete("/:placeId", async (req, res) => {
  const userId = getLoginUserId(req);
  const { placeId } = req.params;

  if (!userId) {
    return res.status(401).json({
      message: "로그인이 필요합니다.",
    });
  }

  try {
    await pool.query(
      `
      DELETE FROM user_favorites
      WHERE user_id = ? AND place_id = ?
      `,
      [userId, placeId],
    );

    res.json({
      message: "즐겨찾기가 해제되었습니다.",
    });
  } catch (error) {
    console.error("즐겨찾기 삭제 실패:", error);
    res.status(500).json({
      message: "즐겨찾기 삭제 실패",
    });
  }
});

module.exports = router;
