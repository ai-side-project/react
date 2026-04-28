import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"

const API_URL = import.meta.env.VITE_API_URL || "/api"

const UserManager = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        withCredentials: true,
      })
      setUsers(response.data)
    } catch (error) {
      console.error("유저 목록 로딩 실패:", error)
      alert("사용자 목록을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 2. 권한 변경 핸들러
  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 1 ? 0 : 1
    const confirmMsg =
      newRole === 1
        ? "관리자로 승격하시겠습니까?"
        : "관리자 권한을 해제하시겠습니까?"

    if (!window.confirm(confirmMsg)) return

    try {
      await axios.patch(
        `${API_URL}/admin/users/${userId}/role`,
        { is_admin: newRole },
        { withCredentials: true },
      )
      alert("권한이 변경되었습니다.")
      fetchUsers() // 목록 새로고침
    } catch (error) {
      alert("권한 변경 실패")
    }
  }
  return (
    <UserWrapper>
      <TitleSection>
        <h1>사용자 권한 관리</h1>
        <p>서비스를 이용 중인 사용자 리스트와 관리자 권한을 관리합니다.</p>
      </TitleSection>

      <TableContainer>
        {loading ? (
          <LoadingText>데이터를 불러오는 중입니다...</LoadingText>
        ) : (
          <UserTable>
            <thead>
              <tr>
                <th>ID</th>
                <th>사용자명</th>
                <th>이메일</th>
                <th>가입일</th>
                <th>권한 상태</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="nickname">{user.nickname}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <RoleBadge $isAdmin={user.is_admin}>
                      {user.is_admin === 1 ? "관리자" : "일반유저"}
                    </RoleBadge>
                  </td>
                  <td>
                    <ActionButton
                      $isAdmin={user.is_admin}
                      onClick={() => handleRoleChange(user.id, user.is_admin)}
                    >
                      {user.is_admin === 1 ? "권한 박탈" : "관리자 승격"}
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </UserTable>
        )}
      </TableContainer>
    </UserWrapper>
  )
}

export default UserManager

// --- Styled Components (Home Theme) ---

const UserWrapper = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`

const TitleSection = styled.div`
  margin-bottom: 32px;
  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.04em;
    margin-bottom: 8px;
  }
  p {
    color: #64748b;
    font-size: 14px;
  }
`

const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  overflow: hidden; /* 테두리 둥글게 유지 */
`

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background: #f8fafc;
    padding: 16px 20px;
    text-align: left;
    color: #64748b;
    font-weight: 700;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .username {
    font-weight: 700;
    color: #0f172a;
  }
`

const RoleBadge = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${(props) => (props.$isAdmin ? "#f0f4ff" : "#f1f5f9")};
  color: ${(props) => (props.$isAdmin ? "#6789ca" : "#64748b")};
`

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$isAdmin ? "#fecaca" : "#e2e8f0")};
  background: #ffffff;
  color: ${(props) => (props.$isAdmin ? "#ef4444" : "#475569")};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$isAdmin ? "#fef2f2" : "#f8fafc")};
    transform: translateY(-1px);
  }
`

const LoadingText = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
`
