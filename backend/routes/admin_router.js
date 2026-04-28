const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const axios = require("axios")
const FormData = require("form-data")
const db = require("../db/db")
const router = express.Router()

const FASTAPI_URL = "http://host.docker.internal:8000/admin/upload"

// ==================== 인증 미들웨어 ====================
function requireAdmin(req, res, next) {
  // 1. 로그인 확인 + 2. 관리자 여부 확인
  if (req.isAuthenticated() && req.user.is_admin === 1) {
    return next()
  }
  // 권한이 없으면 403 Forbidden 응답
  return res
    .status(403)
    .json({ error: "접근 권한이 없는 관리자 전용 페이지입니다." })
}

// ==================== 설정 및 준비 ====================

// 관리자 업로드용 임시 폴더
const adminUploadDir = "chromaupload/admin"
if (!fs.existsSync(adminUploadDir)) {
  fs.mkdirSync(adminUploadDir, { recursive: true })
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, adminUploadDir),
  filename: (req, file, cb) => {
    // 여기서도 한글 복구 로직을 적용해줘야 서버 폴더에 저장되는 파일명이 안 깨집니다.
    const safeName = Buffer.from(file.originalname, "latin1").toString("utf8")
    cb(null, `${Date.now()}-${safeName}`)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB 제한
})
console.log("현재 작업 디렉토리:", process.cwd())
// ==================== 라우트 구현 ====================
/**
 * [GET] /api/admin/users
 * 모든 사용자 목록을 가져옵니다. (관리자 전용)
 */
router.get("/users", requireAdmin, async (req, res) => {
  try {
    // 비밀번호 같은 민감 정보는 제외하고 가져오는 게 포인트!
    const [rows] = await db.query(
      "SELECT id, nickname, email, is_admin, created_at FROM users",
    )
    res.json(rows)
  } catch (error) {
    console.error("사용자 목록 조회 실패:", error)
    res.status(500).json({ error: "사용자 목록을 불러오지 못했습니다." })
  }
})

/**
 * [PATCH] /api/admin/users/:id/role
 * 특정 사용자의 권한을 변경합니다.
 */
router.patch("/users/:id/role", requireAdmin, async (req, res) => {
  const { id } = req.params
  const { is_admin } = req.body // 0 또는 1

  try {
    await db.query("UPDATE users SET is_admin = ? WHERE id = ?", [is_admin, id])
    res.json({ success: true, message: "권한이 변경되었습니다." })
  } catch (error) {
    res.status(500).json({ error: "권한 변경에 실패했습니다." })
  }
})
/**
 * [POST] /upload
 * 관리자 페이지에서 파일을 받아 FastAPI로 토스합니다.
 */
router.post(
  "/upload",
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "파일이 업로드되지 않았습니다." })
    }

    // 한글깨짐 방지
    const safeOriginalName = Buffer.from(
      req.file.originalname,
      "latin1",
    ).toString("utf8")
    console.log(`[Admin] 파일 수신 완료: ${safeOriginalName}`)

    try {
      // 1. FastAPI로 보낼 FormData 생성
      const formData = new FormData()
      // 스트림을 사용하여 대용량 파일도 메모리 부담 없이 전달
      formData.append("file", fs.createReadStream(req.file.path), {
        filename: safeOriginalName,
        contentType: req.file.mimetype,
      })

      // 2. FastAPI 어드민 엔드포인트 호출 (포트 번호 주의: 8000)

      const response = await axios.post(FASTAPI_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })

      // 3. FastAPI 처리가 끝나면 Node 서버의 임시 파일 삭제
      fs.unlinkSync(req.file.path)

      // 4. 최종 성공 응답 반환
      return res.status(200).json({
        success: true,
        message: "데이터 적재가 완료되었습니다.",
        details: {
          ...response.data,
          filename: safeOriginalName, // { filename, chunks }
        },
      })
    } catch (error) {
      console.error("[Admin Error] FastAPI 연동 실패:", error.message)

      // 에러 발생 시에도 임시 파일 삭제
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      return res.status(500).json({
        success: false,
        error: "AI 엔진에서 데이터를 처리하는 중 오류가 발생했습니다.",
        detail: error.message,
      })
    }
  },
)

module.exports = router
