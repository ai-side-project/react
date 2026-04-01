import { NavLink } from "react-router-dom";

const menus = [
  { to: "/", label: "인트로" },
  { to: "/home", label: "종목분석" },
  { to: "/dash", label: "대시보드" },
  { to: "/board", label: "종목토론방" },
  { to: "/review", label: "AI 트레이더" },
];

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
  );
};

export default MainNav;
