const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// 즐겨찾기 목록 조회
router.get("/", async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id || 1;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        p.*
      FROM user_favorites uf
      JOIN places p ON uf.place_id = p.id
      WHERE uf.user_id = ?
      ORDER BY uf.created_at DESC
      `,
      [userId],
    );

    res.json(rows);
  } catch (error) {
    console.error("즐겨찾기 목록 조회 실패:", error);
    res.status(500).json({ message: "즐겨찾기 목록 조회 실패" });
  }
});

// 즐겨찾기 추가
router.post("/:placeId", async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id || 1;
  const { placeId } = req.params;

  try {
    await pool.query(
      `
      INSERT IGNORE INTO user_favorites
      (user_id, place_id)
      VALUES (?, ?)
      `,
      [userId, placeId],
    );

    res.status(201).json({ message: "즐겨찾기에 추가되었습니다." });
  } catch (error) {
    console.error("즐겨찾기 추가 실패:", error);
    res.status(500).json({ message: "즐겨찾기 추가 실패" });
  }
});

// 즐겨찾기 삭제
router.delete("/:placeId", async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id || 1;
  const { placeId } = req.params;

  try {
    await pool.query(
      `
      DELETE FROM user_favorites
      WHERE user_id = ? AND place_id = ?
      `,
      [userId, placeId],
    );

    res.json({ message: "즐겨찾기가 해제되었습니다." });
  } catch (error) {
    console.error("즐겨찾기 삭제 실패:", error);
    res.status(500).json({ message: "즐겨찾기 삭제 실패" });
  }
});

module.exports = router;
