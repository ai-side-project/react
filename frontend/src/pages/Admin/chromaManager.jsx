import React, { useState } from "react"
import axios from "axios"
import styled from "styled-components"

const API_URL = import.meta.env.VITE_API_URL || "/api"

const ChromaManager = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setStatus({ message: "", type: "" })
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setStatus({ message: "파일을 선택해주세요.", type: "error" })
      return
    }
    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)
    setStatus({ message: "데이터 업로드 중... ", type: "info" })

    try {
      const response = await axios.post(`${API_URL}/admin/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      if (response.data.success) {
        setStatus({
          message: `적재 성공: ${response.data.details.filename} (${response.data.details.chunks} chunks)`,
          type: "success",
        })
        setFile(null)
        e.target.reset()
      }
    } catch (error) {
      setStatus({
        message: "적재 실패: " + (error.response?.data?.message || "서버 오류"),
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }
  return (
    <AdminWrapper className="Admin container">
      <TitleSection>
        <h1>Admin Dashboard</h1>
        <p>RAG 시스템의 지식 베이스(ChromaDB)를 관리합니다.</p>
      </TitleSection>

      <UploadContainer>
        <form onSubmit={handleUpload}>
          <Label>서울 여행 가이드 문서 업로드 (.pdf, .txt)</Label>
          <CustomFileInput
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
          />
          <SubmitBtn type="submit" disabled={loading}>
            {loading ? "처리 중..." : "AI 지식 베이스 업데이트"}
          </SubmitBtn>
        </form>

        {status.message && (
          <StatusAlert $type={status.type}>{status.message}</StatusAlert>
        )}
      </UploadContainer>

      <HelpText>
        * 파일 업로드 시 텍스트 추출 및 벡터 임베딩 과정이 자동으로 수행됩니다.
      </HelpText>
    </AdminWrapper>
  )
}

export default ChromaManager

const AdminWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  color: #0f172a; /* var(--text) 계열 */
`

const TitleSection = styled.div`
  margin-bottom: 40px;
  /* 홈의 border-left 스타일 대신 깔끔한 레이아웃으로 변경 */

  h1 {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #0f172a;
    margin-bottom: 8px;
  }

  p {
    color: #64748b; /* var(--muted) 계열 */
    font-size: 15px;
    line-height: 1.6;
  }
`

const UploadContainer = styled.div`
  background: #ffffff;
  padding: 32px;
  border-radius: 18px; /* 홈의 카드 border-radius */
  border: 1px solid #e2e8f0; /* var(--border) */
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04); /* 홈의 그림자 */
`

const Label = styled.label`
  display: block;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #0f172a;
`

const CustomFileInput = styled.input`
  width: 100%;
  padding: 14px;
  background: #f8fafc; /* 홈의 입력창 배경색 */
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 24px;
  color: #334155;
  font-size: 14px;

  &::file-selector-button {
    background: #6789ca; /* var(--primary) 계열 */
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 10px;
    cursor: pointer;
    margin-right: 16px;
    font-weight: 700;
    font-size: 13px;
    transition: 0.2s;

    &:hover {
      background: #5674b0;
    }
  }

  &:focus {
    outline: none;
    border-color: rgba(103, 137, 202, 0.55);
    box-shadow: 0 0 0 4px rgba(103, 137, 202, 0.1);
  }
`

const SubmitBtn = styled.button`
  width: 100%;
  height: 52px;
  background: ${(props) => (props.disabled ? "#e2e8f0" : "#6789ca")};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(103, 137, 202, 0.2);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #5674b0;
    box-shadow: 0 6px 16px rgba(103, 137, 202, 0.3);
  }
`

const StatusAlert = styled.div`
  margin-top: 24px;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;

  /* 홈 테마에 맞춘 부드러운 상태 색상 */
  background: ${(props) => {
    if (props.$type === "success") return "#f0fdf4"
    if (props.$type === "error") return "#fef2f2"
    return "#f1f5f9"
  }};
  color: ${(props) => {
    if (props.$type === "success") return "#15803d"
    if (props.$type === "error") return "#b91c1c"
    return "#475569"
  }};
  border: 1px solid
    ${(props) => {
      if (props.$type === "success") return "#bbf7d0"
      if (props.$type === "error") return "#fecaca"
      return "#e2e8f0"
    }};
`

const HelpText = styled.p`
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8; /* var(--muted) */
  font-weight: 500;
`
