const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const pool = require("../db/db") // ★ db.js (커넥션 풀) 불러오기

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", // 프론트에서 보내는 req.body.email
        passwordField: "password", // 프론트에서 보내는 req.body.password
      },
      async (email, password, done) => {
        try {
          // 1. 이메일로 유저 찾기 (SQL 직접 작성)
          const sql = "SELECT * FROM users WHERE email = ?"
          const [rows] = await pool.query(sql, [email])

          // rows는 배열입니다. 결과가 있으면 길이가 1 이상입니다.
          if (rows.length > 0) {
            const exUser = rows[0] // 첫 번째 유저 정보 가져오기

            // 2. 비밀번호 비교 (입력받은 password vs DB의 해시된 password)
            const result = await bcrypt.compare(password, exUser.password)

            if (result) {
              // 비밀번호 일치 -> 로그인 성공
              done(null, exUser)
            } else {
              // 비밀번호 불일치
              done(null, false, { message: "비밀번호가 일치하지 않습니다." })
            }
          } else {
            // 유저가 없음
            done(null, false, { message: "가입되지 않은 회원입니다." })
          }
        } catch (error) {
          console.error(error)
          done(error)
        }
      },
    ),
  )
}
