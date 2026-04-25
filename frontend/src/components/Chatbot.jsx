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
  const [loading, setLoading] = useState(false) // 로딩 상태 추가
  // 사용자 정보 가져오기
  const user = useAuthStore((state) => state.user)
  // 1. 대화 내역을 저장할 배열 상태 (초기 메시지 포함)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "안녕하세요! 여행에 대해 무엇이든 물어보세요. ✈️",
    },
  ])

  // 스크롤 제어를 위한 Ref
  const messagesEndRef = useRef(null)

  // 메시지가 추가될 때마다 자동으로 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // state인 input을 바로 비울 것이므로, 변수에 따로 저장해둡니다.
    const messageToSend = input
    const currentUserId = user?.id || "guest"

    // 2. 새로운 메시지 객체 생성 (사용자)
    const newUiMessage = {
      role: "user",
      content: input,
    }

    // 3. 기존 배열에 새 메시지 추가
    setMessages((prevMessages) => [...prevMessages, newUiMessage])

    console.log("전송할 데이터:", {
      userId: currentUserId,
      message: input,
    })
    // 입력창 초기화
    setInput("")
    setLoading(true) // 로딩 시작
    //  Node.js API를 호출하여 답변을 받아오기
    try {
      const response = await instance.post(`${API_URL}/chatbot`, {
        userId: currentUserId,
        response: messageToSend,
      })

      // 4. API 응답을 받아서 메시지 배열에 추가
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
          content: "죄송합니다. 서버 연결에 실패했습니다.",
        },
      ])
    } finally {
      setLoading(false) // 로딩 끝
    }
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // 4. 한글 중복 입력 방지 (중요!)
      // 한글은 자음/모음이 조합 중일 때 엔터를 치면 이벤트가 두 번 발생할 수 있음
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
            {/* 5. 배열 데이터를 순회하며 화면에 출력 */}
            {messages.map((msg, index) => (
              <div key={index} className={`msg-bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {/* 자동 스크롤을 위한 더미 div */}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} // 수정된 핸들러 적용
              placeholder="메시지를 입력하세요..."
            />
            <button className="send-btn" onClick={handleSendMessage}>
              전송
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
