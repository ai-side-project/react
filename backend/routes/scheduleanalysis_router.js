const express = require("express");
const db = require("../db/db");

const router = express.Router();

router.get("/:scheduleId/analysis", async (req, res) => {
  const { scheduleId } = req.params;

  try {
    const [scheduleRows] = await db.query(
      `
      SELECT 
        id AS schedule_id,
        title AS schedule_title,
        start_date,
        end_date
      FROM schedules
      WHERE id = ?
      `,
      [scheduleId],
    );

    if (scheduleRows.length === 0) {
      return res.status(404).json({
        message: "일정을 찾을 수 없습니다.",
      });
    }

    const schedule = scheduleRows[0];

    const [placeRows] = await db.query(
      `
      SELECT
        sp.place_id,
        sp.visit_order,
        sp.visit_date,
        sp.visit_time,
        sp.memo,
        p.name,
        p.address,
        p.new_address,
        p.description,
        GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ', ') AS categories
      FROM schedule_items sp
      JOIN places p ON sp.place_id = p.id
      LEFT JOIN place_category_mapping pcm ON p.id = pcm.place_id
      LEFT JOIN categories c ON pcm.category_id = c.id
      WHERE sp.schedule_id = ?
      GROUP BY
        sp.place_id,
        sp.visit_order,
        sp.visit_date,
        sp.visit_time,
        sp.memo,
        p.name,
        p.address,
        p.new_address,
        p.description
      ORDER BY sp.visit_order ASC
      `,
      [scheduleId],
    );

    const places = placeRows.map((place) => ({
      place_id: place.place_id,
      visit_order: place.visit_order,
      visit_date: place.visit_date,
      visit_time: place.visit_time,
      memo: place.memo,
      name: place.name,
      address: place.new_address || place.address,
      description: place.description,
      category: place.categories || "기타",
    }));

    const fastApiResponse = await fetch(
      "http://host.docker.internal:8000/analysis/schedule",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schedule_id: schedule.schedule_id,
          schedule_title: schedule.schedule_title,
          start_date: schedule.start_date,
          end_date: schedule.end_date,
          places,
        }),
      },
    );

    if (!fastApiResponse.ok) {
      throw new Error("FastAPI 일정 분석 요청 실패");
    }

    const analysis = await fastApiResponse.json();

    res.json({
      schedule: {
        ...schedule,
        places,
      },
      analysis,
    });
  } catch (error) {
    console.error("AI 일정 분석 실패:", error);
    res.status(500).json({
      message: "AI 일정 분석 중 문제가 발생했습니다.",
    });
  }
});

module.exports = router;
