const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// 일정 저장
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

    // 1. schedules 테이블에 일정 1개 저장
    const [scheduleResult] = await connection.query(
      `
      INSERT INTO schedules
      (
        user_id,
        title,
        start_date,
        end_date
      )
      VALUES (?, ?, ?, ?)
      `,
      [userId, schedule_title, visit_date, visit_date],
    );

    const scheduleId = scheduleResult.insertId;

    // 2. schedule_items 테이블에 장소 여러 개 저장
    const itemValues = places.map((place, index) => [
      scheduleId,
      place.place_id,
      visit_date,
      visit_time,
      place.visit_order || index + 1,
      memo || null,
    ]);

    await connection.query(
      `
      INSERT INTO schedule_items
      (
        schedule_id,
        place_id,
        visit_date,
        visit_time,
        visit_order,
        memo
      )
      VALUES ?
      `,
      [itemValues],
    );

    await connection.commit();

    res.status(201).json({
      message: "일정이 저장되었습니다.",
      schedule_id: scheduleId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("일정 저장 실패:", error);

    res.status(500).json({
      message: "일정 저장 중 오류가 발생했습니다.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// 저장한 일정 목록 조회
router.get("/", async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id || 1;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        s.id AS schedule_id,
        s.title AS schedule_title,
        s.start_date,
        s.end_date,
        s.created_at,

        si.id AS schedule_item_id,
        si.place_id,
        si.visit_date,
        si.visit_time,
        si.visit_order,
        si.memo,

        p.name,
        p.address,
        p.new_address AS road_address,
        p.description,

        pi.image_url AS main_image_url

      FROM schedules s
      LEFT JOIN schedule_items si
        ON s.id = si.schedule_id
      LEFT JOIN places p
        ON si.place_id = p.id
      LEFT JOIN (
        SELECT
          place_id,
          MIN(image_url) AS image_url
        FROM place_images
        GROUP BY place_id
      ) pi
        ON p.id = pi.place_id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC, si.visit_order ASC
      `,
      [userId],
    );

    const grouped = rows.reduce((acc, row) => {
      const scheduleId = row.schedule_id;

      if (!acc[scheduleId]) {
        acc[scheduleId] = {
          schedule_id: scheduleId,
          schedule_title: row.schedule_title,
          start_date: row.start_date,
          end_date: row.end_date,
          created_at: row.created_at,
          places: [],
        };
      }

      if (row.place_id) {
        acc[scheduleId].places.push({
          schedule_item_id: row.schedule_item_id,
          place_id: row.place_id,
          visit_date: row.visit_date,
          visit_time: row.visit_time,
          visit_order: row.visit_order,
          memo: row.memo,
          name: row.name,
          address: row.address,
          road_address: row.road_address,
          description: row.description,
          main_image_url: row.main_image_url,
        });
      }

      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error("일정 목록 조회 실패:", error);

    res.status(500).json({
      message: "일정 목록 조회 실패",
    });
  }
});

// 일정 상세 조회
router.get("/:scheduleId", async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id || 1;
  const { scheduleId } = req.params;

  try {
    const [rows] = await pool.query(
      `
  SELECT
    s.id AS schedule_id,
    s.title AS schedule_title,
    s.start_date,
    s.end_date,
    s.created_at,

    si.id AS schedule_item_id,
    si.place_id,
    si.visit_date,
    si.visit_time,
    si.visit_order,
    si.memo,

    p.name,
    p.address,
    p.new_address AS road_address,
    p.description,

    pi.image_url AS main_image_url

  FROM schedules s
  LEFT JOIN schedule_items si
    ON s.id = si.schedule_id
  LEFT JOIN places p
    ON si.place_id = p.id
  LEFT JOIN (
    SELECT
      place_id,
      MIN(image_url) AS image_url
    FROM place_images
    GROUP BY place_id
  ) pi
    ON p.id = pi.place_id
  WHERE s.user_id = ? AND s.id = ?
  ORDER BY si.visit_order ASC
  `,
      [userId, scheduleId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "일정을 찾을 수 없습니다.",
      });
    }

    const schedule = {
      schedule_id: rows[0].schedule_id,
      schedule_title: rows[0].schedule_title,
      start_date: rows[0].start_date,
      end_date: rows[0].end_date,
      created_at: rows[0].created_at,
      memo: rows[0].memo || "",
      places: rows
        .filter((row) => row.place_id)
        .map((row) => ({
          schedule_item_id: row.schedule_item_id,
          place_id: row.place_id,
          visit_date: row.visit_date,
          visit_time: row.visit_time,
          visit_order: row.visit_order,
          memo: row.memo,
          name: row.name,
          address: row.address,
          road_address: row.road_address,
          description: row.description,
          main_image_url: row.main_image_url,
        })),
    };

    res.json(schedule);
  } catch (error) {
    console.error("일정 상세 조회 실패:", error);

    res.status(500).json({
      message: "일정 상세 조회 실패",
    });
  }
});

// 일정 수정
router.put("/:scheduleId", async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id || 1;
  const { scheduleId } = req.params;
  const { schedule_title, visit_date, visit_time, memo } = req.body;

  if (!schedule_title || !visit_date || !visit_time) {
    return res.status(400).json({
      message: "일정 제목, 방문 날짜, 시작 시간이 필요합니다.",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE schedules
      SET title = ?, start_date = ?, end_date = ?
      WHERE id = ? AND user_id = ?
      `,
      [schedule_title, visit_date, visit_date, scheduleId, userId],
    );

    await connection.query(
      `
      UPDATE schedule_items
      SET visit_date = ?, visit_time = ?, memo = ?
      WHERE schedule_id = ?
      `,
      [visit_date, visit_time, memo || null, scheduleId],
    );

    await connection.commit();

    res.json({
      message: "일정이 수정되었습니다.",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("일정 수정 실패:", error);

    res.status(500).json({
      message: "일정 수정 실패",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// 일정 삭제
router.delete("/:scheduleId", async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id || 1;
  const { scheduleId } = req.params;

  try {
    const [result] = await pool.query(
      `
      DELETE FROM schedules
      WHERE id = ? AND user_id = ?
      `,
      [scheduleId, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "삭제할 일정을 찾을 수 없습니다.",
      });
    }

    res.json({
      message: "일정이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("일정 삭제 실패:", error);

    res.status(500).json({
      message: "일정 삭제 실패",
    });
  }
});

module.exports = router;
