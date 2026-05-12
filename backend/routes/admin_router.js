const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const axios = require("axios")
const FormData = require("form-data")
const db = require("../db/db")
const router = express.Router()
const FASTAPI_URL =
  process.env.FASTAPI_URL || "http://10.0.1.7:8000/admin/upload"

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
 * [GET] /api/admin/files
 * 적재된 파일 목록 가져오기
 */
router.get("/files", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM rag_files ORDER BY created_at DESC",
    )
    res.json(rows)
  } catch (error) {
    console.error("목록 조회 에러:", error)
    res.status(500).json({ error: "파일 목록을 불러오지 못했습니다." })
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
    console.log(`[Admin] 파일 처리 시작: ${safeOriginalName}`)

    try {
      // --- 1. MySQL 중복 체크 (변경사항 추가) ---
      const [existing] = await db.query(
        "SELECT id FROM rag_files WHERE filename = ?",
        [safeOriginalName],
      )

      if (existing.length > 0) {
        // 이미 파일이 있다면 임시 파일 삭제 후 중단
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
        return res.status(409).json({
          success: false,
          error: "이미 동일한 이름의 파일이 적재되어 있습니다.",
        })
      }

      // --- 2. FastAPI로 보낼 FormData 생성 (기존 로직) ---
      const formData = new FormData()
      formData.append("file", fs.createReadStream(req.file.path), {
        filename: safeOriginalName,
        contentType: req.file.mimetype,
      })

      // --- 3. FastAPI 어드민 엔드포인트 호출 (기존 로직) ---
      const response = await axios.post(FASTAPI_URL, formData, {
        headers: { ...formData.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })

      // --- 4. MySQL에 적재 기록 저장 (변경사항 추가) ---
      // FastAPI가 반환한 chunks 정보를 함께 기록합니다.
      await db.query(
        "INSERT INTO rag_files (filename, file_type, chunks) VALUES (?, ?, ?)",
        [safeOriginalName, req.file.mimetype, response.data.chunks || 0],
      )

      // --- 5. 처리 완료 후 임시 파일 삭제 ---
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)

      return res.status(200).json({
        success: true,
        message: "데이터 적재 및 DB 기록이 완료되었습니다.",
        details: {
          ...response.data,
          filename: safeOriginalName,
        },
      })
    } catch (error) {
      console.error("[Admin Error] 처리 실패:", error.message)

      // 에러 발생 시 임시 파일 삭제
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      return res.status(500).json({
        success: false,
        error: "데이터 처리 중 오류가 발생했습니다.",
        detail: error.message,
      })
    }
  },
)
router.delete("/files/:filename", requireAdmin, async (req, res) => {
  const { filename } = req.params

  try {
    // 1. FastAPI(ChromaDB)에 삭제 요청 전송
    // FastAPI 쪽에 삭제 API를 구현해야 합니다. (예: DELETE /admin/delete?filename=...)
    const FASTAPI_DELETE_URL =
      process.env.FASTAPI_URL || "http://10.0.1.7:8000/admin/delete"
    await axios.delete(FASTAPI_DELETE_URL, { params: { filename } })

    // 2. MySQL에서 정보 삭제
    await db.query("DELETE FROM rag_files WHERE filename = ?", [filename])

    res.json({ success: true, message: "성공적으로 삭제되었습니다." })
  } catch (error) {
    console.error("삭제 에러:", error.message)
    res.status(500).json({ error: "데이터 삭제 중 오류가 발생했습니다." })
  }
})

module.exports = router
