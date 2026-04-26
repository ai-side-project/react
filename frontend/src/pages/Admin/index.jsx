import React, { useState } from "react"
import axios from "axios"
import styled from "styled-components"

const API_URL = import.meta.env.VITE_API_URL || "/api"

const Admin = () => {
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

export default Admin

// --- Styled Components ---

const AdminWrapper = styled.div`
  max-width: 900px;
  margin: 80px auto;
  color: #ffffff;
`

const TitleSection = styled.div`
  margin-bottom: 50px;
  border-left: 5px solid #007bff;
  padding-left: 20px;

  h1 {
    font-size: 2.2rem;
    margin-bottom: 8px;
  }
  p {
    color: #a0a0a0;
  }
`

const UploadContainer = styled.div`
  background: #1e1e1e;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid #333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`

const Label = styled.label`
  display: block;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 20px;
`

const CustomFileInput = styled.input`
  width: 100%;
  padding: 12px;
  background: #2a2a2a;
  border: 2px dashed #444;
  border-radius: 8px;
  margin-bottom: 30px;
  color: #ccc;

  &::file-selector-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 20px;
    transition: 0.3s;

    &:hover {
      background: #0056b3;
    }
  }
`

const SubmitBtn = styled.button`
  width: 100%;
  padding: 15px;
  background: ${(props) => (props.disabled ? "#444" : "#007bff")};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: 0.3s;

  &:hover {
    background: ${(props) => (props.disabled ? "#444" : "#0056b3")};
    transform: ${(props) => (props.disabled ? "none" : "translateY(-2px)")};
  }
`

const StatusAlert = styled.div`
  margin-top: 25px;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;

  /* 상태 타입별 색상 적용 */
  background: ${(props) => {
    if (props.$type === "success") return "#1b4332"
    if (props.$type === "error") return "#5a1a1a"
    return "#2c3e50"
  }};
  color: ${(props) => {
    if (props.$type === "success") return "#b7e4c7"
    if (props.$type === "error") return "#ffb3b3"
    return "#d1d8e0"
  }};
  border: 1px solid
    ${(props) => {
      if (props.$type === "success") return "#2d6a4f"
      if (props.$type === "error") return "#8e1c1c"
      return "#34495e"
    }};
`

const HelpText = styled.p`
  margin-top: 30px;
  text-align: center;
  font-size: 0.85rem;
  color: #666;
`
