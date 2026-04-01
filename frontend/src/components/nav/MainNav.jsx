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
    <nav className="site-nav-v2">
      <ul className="site-nav-v2__list">
        {menus.map((menu) => (
          <li key={menu.to}>
            <NavLink
              to={menu.to}
              end={menu.to === "/"}
              className={({ isActive }) =>
                isActive ? "site-nav-v2__link active" : "site-nav-v2__link"
              }
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
