import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"

const API_URL = import.meta.env.VITE_API_URL || "/api"

const ChromaManager = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [fileList, setFileList] = useState([])

  const fetchFileList = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/files`, {
        withCredentials: true,
      })
      setFileList(response.data)
    } catch (error) {
      console.error("파일 목록 로딩 실패:", error)
    }
  }

  useEffect(() => {
    fetchFileList()
  }, [])

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
    const isDuplicate = fileList.some((f) => f.filename === file.name)
    if (isDuplicate) {
      setStatus({
        message: "이미 동일한 이름의 파일이 적재되어 있습니다.",
        type: "error",
      })
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
        fetchFileList() // 업로드 후 파일 목록 새로고침
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
  const handleDelete = async (filename) => {
    if (!window.confirm(`파일 "${filename}"을(를) 삭제하시겠습니까?`)) return
    try {
      await axios.delete(
        `${API_URL}/admin/files/${encodeURIComponent(filename)}`,
        { withCredentials: true },
      )
      alert("삭제 완료")
      fetchFileList() // 목록 새로고침
    } catch (error) {
      alert("삭제 실패: " + (error.response?.data?.error || "서버 오류"))
    }
  }

  return (
    <AdminWrapper>
      <TitleSection>
        <h1>Knowledge Base Manager</h1>
        <p>AI가 학습할 문서를 업로드하고 관리합니다.</p>
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

      {/* 4. 파일 리스트 테이블 추가 */}
      <ListSection>
        <h3>현재 적재된 문서 목록</h3>
        <TableContainer>
          <FileTable>
            <thead>
              <tr>
                <th>파일명</th>
                <th>청크 수</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {fileList.length > 0 ? (
                fileList.map((f) => (
                  <tr key={f.id}>
                    <td className="filename">{f.filename}</td>
                    <td>{f.chunks}</td>
                    <td>{new Date(f.created_at).toLocaleDateString()}</td>
                    <td>
                      <DeleteBtn onClick={() => handleDelete(f.filename)}>
                        삭제
                      </DeleteBtn>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#94a3b8",
                    }}
                  >
                    적재된 문서가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </FileTable>
        </TableContainer>
      </ListSection>

      <HelpText>
        * 삭제 시 ChromaDB의 벡터 데이터와 MySQL의 기록이 모두 삭제됩니다.
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
const ListSection = styled.div`
  margin-top: 50px;
  h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #0f172a;
  }
`

const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  overflow: hidden;
`

const FileTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    background: #f8fafc;
    padding: 16px;
    text-align: left;
    color: #64748b;
    font-size: 13px;
    border-bottom: 1px solid #e2e8f0;
  }
  td {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    font-size: 14px;
  }
  .filename {
    font-weight: 700;
    color: #0f172a;
  }
`

const DeleteBtn = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: white;
  color: #ef4444;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  &:hover {
    background: #fef2f2;
  }
`
