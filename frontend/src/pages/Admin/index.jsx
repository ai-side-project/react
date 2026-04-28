import React, { useState } from "react"
import styled from "styled-components"
import ChromaManager from "./chromaManager"
import UserManager from "./UserManager"

const Admin = () => {
  const [activeMenu, setActiveMenu] = useState("chroma")

  return (
    <AdminPageLayout>
      {/* 1. 좌측 사이드바 - 홈의 카드 스타일 계승 */}
      <Sidebar>
        <SidebarTitle>관리자 설정</SidebarTitle>
        <MenuList>
          <MenuItem
            $active={activeMenu === "chroma"}
            onClick={() => setActiveMenu("chroma")}
          >
            <i className="bi bi-database-fill-gear"></i> 지식 베이스 관리
          </MenuItem>
          <MenuItem
            $active={activeMenu === "auth"}
            onClick={() => setActiveMenu("auth")}
          >
            <i className="bi bi-people-fill"></i> 어드민 권한 관리
          </MenuItem>
        </MenuList>
      </Sidebar>

      {/* 2. 우측 컨텐츠 영역 - 홈의 배경색 계승 */}
      <ContentSection>
        {activeMenu === "chroma" ? <ChromaManager /> : <UserManager />}
      </ContentSection>
    </AdminPageLayout>
  )
}

export default Admin

// --- Styled Components ---

const AdminPageLayout = styled.div`
  display: flex;
  min-height: calc(100vh - 80px);
  /* 홈 페이지의 기본 배경색 톤 */
  background-color: #f8fafc;
  color: #0f172a; /* var(--text) */
`

const Sidebar = styled.aside`
  width: 280px;
  background: #ffffff;
  /* 홈 페이지의 border 컬러 */
  border-right: 1px solid #e2e8f0;
  padding: 40px 0;
  /* 홈의 카드 shadow 적용 */
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  z-index: 10;
`

const SidebarTitle = styled.h2`
  font-size: 14px;
  font-weight: 800;
  padding: 0 30px;
  margin-bottom: 32px;
  /* 홈 페이지의 eyebrow 스타일 참고 */
  color: #6789ca;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 15px;
`

const MenuItem = styled.div`
  padding: 14px 20px;
  border-radius: 12px; /* 홈의 버튼/입력창 border-radius */
  cursor: pointer;
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? "700" : "500")};

  /* 활성화 시 홈의 primary-weak 배경색과 primary 글자색 적용 */
  color: ${(props) => (props.$active ? "#6789ca" : "#475569")};
  background: ${(props) => (props.$active ? "#f0f4ff" : "transparent")};

  transition: all 0.2s ease;
  display: flex;
  align-items: center;

  &:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }

  i {
    margin-right: 12px;
    font-size: 1.1rem;
  }
`

const ContentSection = styled.section`
  flex: 1;
  padding: 60px 80px;
  background-color: #f8fafc;
  overflow-y: auto;

  /* 홈 페이지의 부드러운 스크롤바 느낌 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
`
