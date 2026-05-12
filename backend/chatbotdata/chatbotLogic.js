const SCENARIOS = require("./chatbotData")
const axios = require("axios")

const FASTAPI_URL = "http://host.docker.internal:8000/chatbot/"

async function callAiAgent(userId, message) {
  try {
    const response = await axios.post(
      FASTAPI_URL,
      { message: message, userId: userId },
      { timeout: 300000 },
    )
    return `🤖 [서울로 가이드]: ${response.data.result}`
  } catch (error) {
    if (error.code === "ECONNABORTED")
      return " [AI 가이드]: 분석량이 많아 시간이 초과되었습니다. 다시 시도해주세요."
    return " [AI 가이드]: 분석 서버 통신 중 오류가 발생했습니다."
  }
}

const getBotResponse = async (userId, message) => {
  const msg = message.trim().replace(/ /g, "")

  // --- [STAGE 1] 고정 메뉴 및 가이드 대응 (숫자 및 핵심 키워드) ---

  // 메인 복귀
  if (["안녕", "시작", "메뉴", "처음"].some((k) => msg.includes(k)))
    return SCENARIOS.welcome

  // 1번: 추천 가이드
  if (msg === "1" || (msg === "추천" && message.length < 5))
    return SCENARIOS.recommend_main

  // 2번: 일정 가이드
  if (msg === "2" || (msg === "일정" && message.length < 5))
    return SCENARIOS.schedule_info

  // 3번: 기술 가이드
  if (
    msg === "3" ||
    ["기술", "원리", "RAG", "머신러닝"].some((k) => msg.includes(k))
  )
    return SCENARIOS.tech_info

  // 4번: 자유 질문 안내
  if (msg === "4") return SCENARIOS.free_ask

  // --- [STAGE 2] AI 분석 엔진 호출 (구체적 질문 감지) ---

  const aiKeywords = [
    "평가",
    "난이도",
    "테마",
    "혼잡도",
    "동선",
    "분석",
    "루트",
  ]
  const hasAiKeyword = aiKeywords.some((k) => msg.includes(k))

  // 서울 지명 및 날짜 감지
  const hasSpecificInfo =
    /\d{1,2}월|\d{1,2}일|202\d/.test(message) ||
    ["구", "역", "로", "시"].some((suffix) => msg.includes(suffix))

  // 분석 키워드가 있거나, 지명이 있거나, 문장이 길면 AI 호출
  if (hasAiKeyword || hasSpecificInfo || message.length > 10) {
    return await callAiAgent(userId, message)
  }

  // --- [STAGE 3] 기존 서울 내부 로직 및 감정 처리 ---
  if (msg.includes("힐링")) return SCENARIOS.healing
  if (msg.includes("액티비티")) return SCENARIOS.activity
  if (msg.includes("먹방") || msg.includes("맛집")) return SCENARIOS.mukbang

  if (msg.includes("힘들") || msg.includes("집")) return SCENARIOS.gohome
  if (["ㅋㅋ", "ㅎㅎ"].some((k) => msg.includes(k))) return SCENARIOS.laugh
  if (["ㅠㅠ", "ㅠ"].some((k) => msg.includes(k))) return SCENARIOS.sad

  // --- [STAGE 4] 최종 폴백 (나머지는 AI 질문으로 간주) ---
  return await callAiAgent(userId, message)
}

module.exports = { getBotResponse }
