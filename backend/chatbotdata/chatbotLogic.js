const SCENARIOS = require("./chatbotData")
const axios = require("axios")

const FASTAPI_URL = "http://host.docker.internal:8000/chatbot/"

const getBotResponse = async (userId, message) => {
  // 1. 입력값 정제
  const msg = message.trim().replace(/ /g, "")
  console.log("현재 입력된 메시지:", msg)

  // 2. 고정 시나리오 체크 (가장 먼저 수행)
  // 메인 메뉴
  if (
    ["안녕", "반가", "하이", "시작", "메뉴", "처음"].some((k) =>
      msg.includes(k),
    )
  )
    return SCENARIOS.welcome

  // 대분류
  if (msg.includes("1") || msg.includes("추천") || msg.includes("여행지"))
    return SCENARIOS.recommend_main
  if (msg.includes("2") || msg.includes("코스") || msg.includes("인기"))
    return SCENARIOS.course_main
  if (
    msg.includes("3") ||
    msg.includes("고객센터") ||
    msg.includes("센터") ||
    msg.includes("문의")
  )
    return SCENARIOS.support

  // 세부 추천 키워드
  if (msg.includes("힐링") || msg.includes("휴식") || msg.includes("숲"))
    return SCENARIOS.healing
  if (msg.includes("액티비티") || msg.includes("서핑") || msg.includes("운동"))
    return SCENARIOS.activity
  if (msg.includes("먹방") || msg.includes("맛집") || msg.includes("음식"))
    return SCENARIOS.mukbang

  // 세부 지역 키워드
  if (msg.includes("인천") || msg.includes("월미도") || msg.includes("차이나"))
    return SCENARIOS.course_incheon
  if (msg.includes("가평") || msg.includes("남이섬") || msg.includes("캠핑"))
    return SCENARIOS.course_gapyeong

  // 감정 및 이스터에그
  if (msg.includes("집") || msg.includes("퇴근") || msg.includes("힘들"))
    return SCENARIOS.gohome
  if (["ㅋㅋ", "ㅎㅎ", "ㅋ", "ㅎ"].some((k) => msg.includes(k)))
    return SCENARIOS.laugh
  if (["ㅠㅠ", "ㅜㅜ", "ㅠ", "우울"].some((k) => msg.includes(k)))
    return SCENARIOS.sad
  if (["ㅡㅡ", "-_-", "짜증", "바보", "답답"].some((k) => msg.includes(k)))
    return SCENARIOS.angry

  // 3. 위 조건에 하나도 걸리지 않았을 때만 AI 상담원(FastAPI) 호출
  // 명시적으로 '4'번을 눌렀거나, 상담원 연결을 요청한 경우도 포함됨
  try {
    console.log(`[규칙 없음] -> FastAPI(Ollama) 요청 전송: ${message}`)
    const response = await axios.post(FASTAPI_URL, {
      message: message,
      userId: userId,
    })
    return ` [AI 가이드]: ${response.data.result}`
  } catch (error) {
    console.error("❌ FastAPI 연결 실패:", error.message)
    return SCENARIOS.unknown(message)
  }
}

module.exports = { getBotResponse }
