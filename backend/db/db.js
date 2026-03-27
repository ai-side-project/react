const mysql = require("mysql2/promise")
require("dotenv").config() // 최상단에 추가: .env 파일을 읽어오기 위함

const pool = mysql.createPool({
  // 도커 환경변수가 있으면 그걸 쓰고, 없으면(로컬이면) "localhost"를 쓴다는 의미입니다.
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "side_project",
  waitForConnections: true,
  connectionLimit: 10,
})

module.exports = pool
