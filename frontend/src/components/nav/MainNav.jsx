import { NavLink } from "react-router-dom"

const menus = [
  { to: "/", label: "인트로" },
  { to: "/home", label: "홈" },
  { to: "/dash", label: "대시보드" },
  { to: "/board", label: "게시판" },
  { to: "/review", label: "AI 추천서비스" },
]

const MainNav = () => {
  return (
    <nav className="MainNav">
      <ul>
        {menus.map((menu) => (
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
