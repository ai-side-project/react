import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const menus = [
  { to: "/", label: "인트로" },
  { to: "/search", label: "여행지 검색" },
  { to: "/schedule", label: "여행 코스 생성" },
  { to: "/schedule-management", label: "스케줄 관리" },
  { to: "/admin", label: "관리자 설정", adminOnly: true },
];

const MainNav = () => {
  const { user } = useAuthStore(); // 필요한 데이터만 깔끔하게 추출

  console.log("로그인된 유저 전체 데이터:", user);
  return (
    <nav className="MainNav">
      <ul>
        {menus
          .filter((menu) => {
            // 관리자 전용 메뉴(adminOnly: true)인 경우
            if (menu.adminOnly) {
              // user가 null이면 에러 없이 false를 반환하게 됨
              return user?.isadmin === 1;
            }
            // 일반 메뉴는 통과
            return true;
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
  );
};

export default MainNav;
