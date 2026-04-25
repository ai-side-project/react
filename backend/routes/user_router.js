const express = require("express")
const bcrypt = require("bcrypt")
const passport = require("passport")
const pool = require("../db/db") // ★ db.js (커넥션 풀) 불러오기

const router = express.Router()

// GET /api/users/me - 로그인된 사용자 정보 확인
router.get("/me", (req, res) => {
  console.log("인증 여부:", req.isAuthenticated())
  console.log("로그인된 유저 정보(req.user):", req.user)

  if (req.isAuthenticated() && req.user) {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        nickname: req.user.nickname,
        email: req.user.email,
        isadmin: req.user.is_admin,
      },
    })
  }
  return res.status(401).json({ success: false, message: "로그인 필요" })
})

// POST /api/users/join - 회원가입 (SQL 방식으로 변경됨)
router.post("/join", async (req, res, next) => {
  const { nickname, email, password } = req.body
  console.log("회원가입 요청:", nickname, email, password)

  if (!nickname || !email || !password) {
    return res
      .status(400)
      .json({ error: "이메일, 닉네임, 비밀번호를 모두 입력해주세요." })
  }

  try {
    // 1. 이미 존재하는 이메일인지 확인 (SELECT)
    // 기존: await User.findOne({ where: { email } })
    const checkSql = "SELECT * FROM users WHERE email = ?"
    const [existingUsers] = await pool.query(checkSql, [email])

    if (existingUsers.length > 0) {
      return res.status(403).json({ error: "이미 등록된 이메일입니다." })
    }

    // 2. 비밀번호 해시화
    const hash = await bcrypt.hash(password, 12)

    // 3. 사용자 정보 저장 (INSERT)
    // 기존: await User.create({ ... })
    const insertSql =
      "INSERT INTO users (nickname, email, password) VALUES (?, ?, ?)"
    await pool.query(insertSql, [nickname, email, hash])

    return res.status(201).json({ message: "회원가입 성공" })
  } catch (error) {
    console.error(error)
    return next(error) // 에러 처리 미들웨어로 넘김
  }
})

// POST /api/users/login - 로그인
// (Passport 내부 로직도 SQL로 바뀌어 있어야 정상 작동합니다)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError)
      return res.status(500).json({ error: "서버 내부 에러" })
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: info.message || "로그인 정보가 올바르지 않습니다." })
    }

    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError)
        return res.status(500).json({ error: "로그인 처리 중 에러 발생" })
      }

      // 세션 저장 후 응답
      return req.session.save((err) => {
        if (err) {
          console.error(err)
          return res.status(500).json({ error: "세션 저장 실패" })
        }

        return res.status(200).json({
          message: "로그인 성공",
          user: {
            id: user.id,
            nickname: user.nickname,
            email: user.email,
            isadmin: user.is_admin,
          },
        })
      })
    })
  })(req, res, next)
})

// POST /api/users/logout - 로그아웃
router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.json({ success: true, message: "이미 로그아웃 상태입니다." })
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("세션 삭제 오류:", err)
      return res.status(500).json({ error: "로그아웃 실패" })
    }

    res.clearCookie("connect.sid") // 쿠키 삭제
    return res.json({ success: true, message: "로그아웃 되었습니다." })
  })
})

module.exports = router
