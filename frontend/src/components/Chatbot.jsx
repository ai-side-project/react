import React, { useState, useEffect, useRef } from "react"
import "./Chatbot.css"
import axios from "axios"
import { useAuthStore } from "../store/authStore"

const API_URL = import.meta.env.VITE_API_URL || "/api"

const instance = axios.create({
  withCredentials: true,
})

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((state) => state.user)

  // 1. 초기 메시지 수정 (SCENARIOS.welcome 내용 반영)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `✈️ **서울 관광 AI 가이드, '서울로'**입니다!
서울시 빅데이터와 최첨단 AI 기술로 여행을 설계해 드릴게요.

🔍 **서울로의 핵심 기술**
• 1,600여 개 관광지 정밀 분석
• 실시간 웹 검색 기반 최신 정보 최적화
• 머신러닝 기반 구별 혼잡도 예측
• AI 전문가의 일정 심층 평가

👇 무엇을 도와드릴까요?`,
    },
  ])

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading]) // loading 상태가 변할 때도 스크롤 최하단 이동

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const messageToSend = input
    const currentUserId = user?.id || "guest"

    const newUiMessage = {
      role: "user",
      content: input,
    }

    setMessages((prevMessages) => [...prevMessages, newUiMessage])
    setInput("")
    setLoading(true) // 로딩 시작

    try {
      const response = await instance.post(`${API_URL}/chatbot`, {
        userId: currentUserId,
        response: messageToSend,
      })

      const aiResponse =
        response.data.response || "죄송합니다. 답변을 받을 수 없습니다."

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: aiResponse },
      ])
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "죄송합니다. 서버 연결에 실패했습니다 로그인을 해주세요.",
        },
      ])
    } finally {
      setLoading(false) // 로딩 끝
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.nativeEvent.isComposing) return
      handleSendMessage()
    }
  }

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">서울여행 플래너 AI 상담원</div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`msg-bubble ${msg.role}`}>
                {/* 텍스트 내 줄바꿈 처리를 위해 white-space 적용 권장 */}
                <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
              </div>
            ))}

            {/* 2. 로딩 중일 때 표시할 AI 분석 말풍선 */}
            {loading && (
              <div className="msg-bubble assistant loading-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="loading-text">
                  🤖 AI 전문가 '서울로'가 시스템에 접속 중입니다...
                  <br />
                  <small>• ChromaDB 데이터 및 실시간 웹 정보 분석 중</small>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              disabled={loading} // 로딩 중에는 입력 방지
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={loading}
            >
              {loading ? "..." : "전송"}
            </button>
          </div>
        </div>
      )}

      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  )
}

export default Chatbot
