const passport = require("passport")
const local = require("./LocalStrategy")
const pool = require("../db/db") // ★ models 대신 db.js 연결

module.exports = () => {
  // 로그인 성공 시 세션에 '아이디(id)'만 저장
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // 페이지 이동마다 세션의 '아이디'로 DB에서 실제 유저 정보를 조회
  passport.deserializeUser(async (id, done) => {
    try {
      // console.log("디시리얼라이즈 실행:", id);

      // [변경] Sequelize: User.findOne({ where: { id } })
      // -> SQL: SELECT * FROM users WHERE id = ?
      const sql = "SELECT * FROM users WHERE id = ?"
      const [rows] = await pool.query(sql, [id])

      if (rows.length === 0) {
        // 유저를 찾지 못한 경우
        return done(null, false)
      }

      // rows는 배열이므로 첫 번째 요소를 가져옵니다.
      const user = rows[0]
      done(null, user) // 이제 req.user에 이 user 객체가 저장됩니다.
    } catch (e) {
      console.error(e)
      done(e)
    }
  })

  local()
}
