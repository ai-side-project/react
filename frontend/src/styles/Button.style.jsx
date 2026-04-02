import styled from "styled-components"

export const CommonAuthButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  background-color: var(--primary) !important;
  color: var(--on-primary) !important;
  border: 1px solid var(--primary) !important;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-top: 0 !important;
  min-width: 80px;

  &:hover {
    background-color: var(--primary-hover) !important;
    border-color: var(--primary-hover) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
    color: #ffffff !important;
  }

  &:active {
    transform: translateY(1px);
  }
`
