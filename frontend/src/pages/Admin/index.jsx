import React, { useState } from "react"
import styled from "styled-components"
import ChromaManager from "./chromaManager"
import UserManager from "./UserManager" // 새로 만들 컴포넌트

const Admin = () => {
  const [activeMenu, setActiveMenu] = useState("chroma") // 'chroma' | 'auth'

  return (
    <AdminPageLayout>
      {/* 1. 좌측 사이드바 */}
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

      {/* 2. 우측 컨텐츠 영역 */}
      <ContentSection>
        {activeMenu === "chroma" ? (
          <ChromaManager /> // 여기에 기존의 업로드 UI 코드를 넣으시면 됩니다.
        ) : (
          <UserManager /> // 권한 관리용 컴포넌트
        )}
      </ContentSection>
    </AdminPageLayout>
  )
}

export default Admin

// --- Styled Components ---

const AdminPageLayout = styled.div`
  display: flex;
  min-height: calc(100vh - 100px); /* 헤더 높이 제외 */
  background-color: #0f0f0f;
  color: #ffffff;
`

const Sidebar = styled.aside`
  width: 280px;
  background: #1a1a1a;
  border-right: 1px solid #333;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
`

const SidebarTitle = styled.h2`
  font-size: 1.4rem;
  padding: 0 30px;
  margin-bottom: 40px;
  color: #007bff;
  font-weight: 700;
`

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const MenuItem = styled.div`
  padding: 18px 30px;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  color: ${(props) => (props.$active ? "#ffffff" : "#888")};
  background: ${(props) =>
    props.$active
      ? "linear-gradient(90deg, #007bff33 0%, transparent 100%)"
      : "transparent"};
  border-left: 4px solid
    ${(props) => (props.$active ? "#007bff" : "transparent")};
  transition: 0.2s all ease-in-out;

  &:hover {
    background: #252525;
    color: #fff;
  }

  i {
    margin-right: 12px;
  }
`

const ContentSection = styled.section`
  flex: 1;
  padding: 60px;
  overflow-y: auto;
`
