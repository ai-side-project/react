import { NavLink } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"

const menus = [
  { to: "/", label: "인트로" },
  { to: "/home", label: "홈" },
  { to: "/dash", label: "대시보드" },
  { to: "/board", label: "게시판" },
  { to: "/review", label: "AI 추천서비스" },
  { to: "/admin", label: "관리자 설정", adminOnly: true },
]

const MainNav = () => {
  const { user } = useAuthStore() // 필요한 데이터만 깔끔하게 추출

  console.log("로그인된 유저 전체 데이터:", user)
  return (
    <nav className="MainNav">
      <ul>
        {menus
          .filter((menu) => {
            // 관리자 전용 메뉴(adminOnly: true)인 경우
            if (menu.adminOnly) {
              // user가 null이면 에러 없이 false를 반환하게 됨
              return user?.isadmin === 1
            }
            // 일반 메뉴는 통과
            return true
          })
          .map((menu) => (
            <li key={menu.to}>
              <NavLink
                to={menu.to}
                end={menu.to === "/"}
                className={({ isActive }) => (isActive ? "check" : "")}
              >
                {menu.label}
              </NavLink>
            </li>
          ))}
      </ul>
    </nav>
  )
}

export default MainNav
