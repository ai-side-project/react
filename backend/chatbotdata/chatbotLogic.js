const SCENARIOS = require("./chatbotData")
const axios = require("axios")

const FASTAPI_URL = "http://host.docker.internal:8000/chatbot/"

/**
 * AI 상담원(FastAPI) 호출을 담당하는 보조 함수
 */
async function callAiAgent(userId, message) {
  try {
    console.log(`[AI 호출] -> FastAPI(Ollama) 요청 전송: ${message}`)
    const response = await axios.post(FASTAPI_URL, {
      message: message,
      userId: userId,
    })
    // FastAPI로부터 받은 답변 반환
    return ` [AI 가이드]: ${response.data.result}`
  } catch (error) {
    console.error("❌ FastAPI 연결 실패:", error.message)
    return SCENARIOS.unknown(message)
  }
}

const getBotResponse = async (userId, message) => {
  // 1. 입력값 정제 (공백 제거 버전)
  const msg = message.trim().replace(/ /g, "")

  // [수정 핵심] 날짜나 구체적인 지명이 포함되어 있다면 시나리오를 건너뛰고 AI 호출
  // 정규식: 'n월' 또는 'n일' 또는 '202x년' 포함 여부 확인
  const hasDate = /\d{1,2}월|\d{1,2}일|202\d/.test(message)

  // 구체적인 장소 키워드 (여기에 검색을 원하는 장소를 추가하세요)
  const isSpecificQuery =
    msg.includes("경복궁") ||
    msg.includes("강남") ||
    msg.includes("광화문") ||
    msg.includes("도봉") ||
    hasDate

  if (isSpecificQuery) {
    console.log(`[AI 우선순위] 구체적 질문 감지 -> AI 답변으로 이동`)
    return await callAiAgent(userId, message)
  }

  // 2. 고정 시나리오 체크 (가장 먼저 수행)
  // 메인 메뉴
  if (
    ["안녕", "반가", "하이", "시작", "메뉴", "처음"].some((k) =>
      msg.includes(k),
    )
  )
    return SCENARIOS.welcome

  // 대분류 (일반적인 단축 번호나 메뉴명 클릭 시)
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

  // 3. 위 조건에 하나도 걸리지 않았을 때 (기타 질문) AI 상담원 호출
  return await callAiAgent(userId, message)
}

module.exports = { getBotResponse }
