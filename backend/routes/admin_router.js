const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const axios = require("axios")
const FormData = require("form-data")

const router = express.Router()

// ==================== 인증 미들웨어 ====================
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.status(401).json({ error: "로그인이 필요합니다." })
}

module.exports = router
