import { useState } from "react"
import { Link } from "react-router"

const MainNav = () => {
  const [select, setSelect] = useState("home")
  return (
    <div className="MainNav">
      <ul>
        <Link to="/">
          <li
            className={`${select === "Home" ? "check" : ""}`}
            onClick={() => setSelect("Home")}
          >
            Home
          </li>
        </Link>
        <Link to="/dash">
          <li
            className={`${select === "Dash" ? "check" : ""}`}
            onClick={() => setSelect("Dash")}
          >
            DashBoard
          </li>
        </Link>
        <Link to="/board">
          <li
            className={`${select === "Board" ? "check" : ""}`}
            onClick={() => setSelect("Board")}
          >
            Board
          </li>
        </Link>
        <Link to="/album">
          <li
            className={`${select === "Album" ? "check" : ""}`}
            onClick={() => setSelect("Album")}
          >
            Album
          </li>
        </Link>
        <Link to="/theme">
          <li
            className={`${select === "Theme" ? "check" : ""}`}
            onClick={() => setSelect("Theme")}
          >
            Theme
          </li>
        </Link>
        <Link to="/review">
          <li
            className={`${select === "Review" ? "check" : ""}`}
            onClick={() => setSelect("Review")}
          >
            Review
          </li>
        </Link>
      </ul>
    </div>
  )
}

export default MainNav
