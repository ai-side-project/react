const express = require("express")
const router = express.Router()
const { getBotResponse } = require("../chatbotdata/chatbotLogic")

// ==================== 인증 미들웨어 ====================
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.status(401).json({ error: "로그인이 필요합니다." })
}

// ==================== 챗봇 라우터 ====================
router.post("/", requireAuth, async (req, res) => {
  const { userId, response } = req.body

  console.log(`User ID: ${userId}, Message: ${response}`)

  try {
    //await 키워드  (FastAPI 응답 대기)
    //userId 인자 (getBotResponse(userId, response) 순서 중요)
    const aiResponse = await getBotResponse(userId, response)

    // 정상적으로 답변을 받아오면 클라이언트에 전송
    return res.json({ response: aiResponse })
  } catch (error) {
    // [수정 3] 에러 처리 추가
    console.error("챗봇 로직 처리 중 에러 발생:", error)
    return res.status(500).json({
      response:
        "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    })
  }
})

module.exports = router
