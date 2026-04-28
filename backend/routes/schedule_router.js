const express = require("express");
const router = express.Router();
const pool = require("../db/db");

router.post("/", async (req, res) => {
  const { schedule_title, visit_date, visit_time, memo, places } = req.body;

  const userId = req.user?.id || req.session?.user?.id || 1;

  if (!schedule_title || !visit_date || !visit_time) {
    return res.status(400).json({
      message: "일정 제목, 방문 날짜, 시작 시간이 필요합니다.",
    });
  }

  if (!Array.isArray(places) || places.length === 0) {
    return res.status(400).json({
      message: "일정에 추가할 장소가 필요합니다.",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const values = places.map((place, index) => [
      userId,
      place.place_id,
      schedule_title,
      visit_date,
      visit_time,
      place.visit_order || index + 1,
      memo || null,
    ]);

    await connection.query(
      `
      INSERT INTO user_schedules
      (
        user_id,
        place_id,
        schedule_title,
        visit_date,
        visit_time,
        visit_order,
        memo
      )
      VALUES ?
      `,
      [values],
    );

    await connection.commit();

    return res.status(201).json({
      message: "일정이 저장되었습니다.",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("일정 저장 실패:", error);

    return res.status(500).json({
      message: "일정 저장 중 오류가 발생했습니다.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.get("/", async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id || 1;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        us.schedule_group_id,
        us.schedule_title,
        us.visit_date,
        us.visit_time,
        us.memo,
        us.place_id,
        us.visit_order,
        p.name,
        p.address,
        p.road_address
      FROM user_schedules us
      JOIN places p ON us.place_id = p.id
      WHERE us.user_id = ?
      ORDER BY us.visit_date DESC, us.visit_time DESC, us.visit_order ASC
      `,
      [userId],
    );

    const grouped = rows.reduce((acc, row) => {
      const groupId = row.schedule_group_id;

      if (!acc[groupId]) {
        acc[groupId] = {
          schedule_group_id: groupId,
          schedule_title: row.schedule_title,
          visit_date: row.visit_date,
          visit_time: row.visit_time,
          memo: row.memo,
          places: [],
        };
      }

      acc[groupId].places.push({
        place_id: row.place_id,
        visit_order: row.visit_order,
        name: row.name,
        address: row.address,
        road_address: row.road_address,
      });

      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error("일정 목록 조회 실패:", error);
    res.status(500).json({ message: "일정 목록 조회 실패" });
  }
});

module.exports = router;
