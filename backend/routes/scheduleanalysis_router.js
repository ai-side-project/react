const express = require("express");
const db = require("../db/db");

const router = express.Router();

router.get("/:scheduleId/analysis", async (req, res) => {
  const { scheduleId } = req.params;

  try {
    // 1. 일정 기본 정보 조회
    const [scheduleRows] = await db.query(
      `
      SELECT 
        id AS schedule_id,
        title AS schedule_title,
        start_date,
        end_date,
        NULL AS memo
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

    // 2. 일정에 포함된 장소 목록 조회
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
    p.description
  FROM schedule_items sp
  JOIN places p ON sp.place_id = p.id
  WHERE sp.schedule_id = ?
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
      category: "기타",
    }));

    // 3. Ollama 프롬프트 만들기
    const prompt = `
너는 서울 여행 일정 분석 AI야.
아래 일정을 보고 한국어로 짧고 명확하게 피드백해줘.

일정 제목: ${schedule.schedule_title}
여행 기간: ${schedule.start_date} ~ ${schedule.end_date}

장소 목록:
${places
  .map((place) => `${place.visit_order}. ${place.name} - ${place.address}`)
  .join("\n")}

반드시 JSON만 출력해.
마크다운, 설명문, 코드블록은 쓰지 마.
각 문장은 60자 이내로 짧게 작성해.

{
  "summary": "전체 일정 요약 한 문장",
  "routeFeedback": "동선 평가 한 문장",
  "difficulty": "쉬움",
  "goodPoints": ["좋은 점 1", "좋은 점 2"],
  "improvements": ["개선점 1", "개선점 2"],
  "recommendedTitles": ["추천 제목 1", "추천 제목 2", "추천 제목 3"],
  "scores": {
    "difficulty": 3,
    "moveBurden": 3,
    "outdoorRatio": 3,
    "relaxedLevel": 3,
    "recommendation": 3
  },
  "recommendedOrder": ${JSON.stringify(
    places.map((place) => ({
      place_id: place.place_id,
      name: place.name,
      reason: "추천 이유 한 문장",
    })),
  )}
}

difficulty는 쉬움, 보통, 어려움 중 하나만 써.
scores의 값은 1부터 5 사이 숫자로만 써.
recommendedOrder는 장소 목록 안의 장소만 사용해.
`;
    // 4. Ollama 호출
    const ollamaResponse = await fetch(
      "http://host.docker.internal:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma4:e2b",
          prompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.2,
            num_predict: 1800,
          },
        }),
      },
    );

    if (!ollamaResponse.ok) {
      throw new Error("Ollama 분석 요청 실패");
    }

    const ollamaData = await ollamaResponse.json();

    let analysis;

    try {
      const rawResponse = ollamaData.response.trim();

      const jsonStart = rawResponse.indexOf("{");
      const jsonEnd = rawResponse.lastIndexOf("}");

      const jsonText =
        jsonStart !== -1 && jsonEnd !== -1
          ? rawResponse.slice(jsonStart, jsonEnd + 1)
          : rawResponse;

      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Ollama JSON 파싱 실패:", parseError);

      analysis = {
        summary: ollamaData.response,
        routeFeedback: "AI 응답을 구조화하지 못했습니다.",
        difficulty: "보통",
        goodPoints: [],
        improvements: [],
        recommendedTitles: [],
        scores: {
          difficulty: 3,
          moveBurden: 3,
          outdoorRatio: 3,
          relaxedLevel: 3,
          recommendation: 3,
        },
        recommendedOrder: places.map((place) => ({
          place_id: place.place_id,
          name: place.name,
          reason: "기존 방문 순서를 유지합니다.",
        })),
      };
    }

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
