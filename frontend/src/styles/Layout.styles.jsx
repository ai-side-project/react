import styled from "styled-components"

export const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

export const Container = styled.div`
  width: min(var(--container-w), calc(100% - 32px));
  margin: 0 auto;
`

export const MainContent = styled.main`
  flex: 1;
  padding: 28px 0 40px;
  width: min(var(--container-w), calc(100% - 32px));
  margin: 0 auto;
`

export const FooterWrapper = styled.footer`
  border-top: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  padding: 18px 0;
  color: var(--muted);
  font-size: 13px;
  text-align: center;
`

export const HeaderRight = styled.div`
  margin-bottom: 0 !important;
  display: flex;
  align-items: center;
`

export const AuthButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
