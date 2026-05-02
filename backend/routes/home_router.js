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
router.get("/", async (req, res) => {
  res.json({ message: "home api" })
})

router.get("/search", async (req, res) => {
  const keyword = req.query.keyword || ""

  if (!keyword.trim()) {
    return res.json([])
  }

  try {
    const searchKeyword = `%${keyword.trim()}%`

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.address,
        p.latitude,
        p.longitude,
        p.telephone,
        p.website,
        p.opening_hours,
        p.operating_days,
        p.closed_days,
        p.traffic_info_subway,
        p.traffic_info_bus,
        pi.image_url AS main_image_url
      FROM places p
      LEFT JOIN place_images pi
        ON p.id = pi.place_id
        AND pi.is_main = 1
      WHERE
        p.name LIKE ?
        OR p.description LIKE ?
        OR p.address LIKE ?
        OR p.road_address LIKE ?
      ORDER BY p.id DESC
      `,
      [searchKeyword, searchKeyword, searchKeyword, searchKeyword],
    )

    res.json(rows)
  } catch (error) {
    console.error("홈 장소 검색 오류:", error)
    res.status(500).json({ message: "장소 검색 중 오류가 발생했습니다." })
  }
})

router.get("/category", async (req, res) => {
  const category = req.query.category || ""

  if (!category.trim()) {
    return res.json([])
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.address,
        p.road_address,
        p.latitude,
        p.longitude,
        p.telephone,
        p.website,
        p.opening_hours,
        p.operating_days,
        p.closed_days,
        p.traffic_info_subway,
        p.traffic_info_bus,
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
    )

    res.json(rows)
  } catch (error) {
    console.error("홈 카테고리 검색 오류:", error)
    res.status(500).json({ message: "카테고리 검색 중 오류가 발생했습니다." })
  }
})

router.get("/places/:id", async (req, res) => {
  const placeId = req.params.id

  try {
    const [placeRows] = await pool.query(
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
      WHERE id = ?
      `,
      [placeId],
    )

    if (placeRows.length === 0) {
      return res.status(404).json({ message: "장소를 찾을 수 없습니다." })
    }

    const [imageRows] = await pool.query(
      `
      SELECT
        id,
        image_url,
        is_main,
        sort_order
      FROM place_images
      WHERE place_id = ?
      ORDER BY sort_order ASC
      `,
      [placeId],
    )

    res.json({
      place: placeRows[0],
      images: imageRows,
    })
  } catch (error) {
    console.error("장소 상세 조회 오류:", error)
    res.status(500).json({ message: "장소 상세 조회 중 오류가 발생했습니다." })
  }
})

module.exports = router
