const pool = require("../db/db")
const fs = require("fs")
const path = require("path")

async function run() {
  // 파일명이 data.json인지 데이터_6.json인지 꼭 확인해서 수정하세요!
  const jsonPath = path.join(__dirname, "data.json")
  const rawData = fs.readFileSync(jsonPath, "utf8")
  const places = JSON.parse(rawData).data

  console.log(`🚀 총 ${places.length}개의 데이터 주입을 시작합니다...`)

  const connection = await pool.getConnection()

  try {
    for (const item of places) {
      try {
        // 날짜 형식 변환 (2026.04.29 -> 2026-04-29)[cite: 2]
        const sDate = item.start_date
          ? item.start_date.replace(/\./g, "-")
          : null
        const eDate = item.end_date ? item.end_date.replace(/\./g, "-") : null

        // [중요 수정] website_lang 타입 체크 후 안전하게 처리
        let websiteLangs = []
        if (typeof item.website_lang === "string") {
          websiteLangs = item.website_lang.split(",").map((s) => s.trim())
        } else if (Array.isArray(item.website_lang)) {
          websiteLangs = item.website_lang
        }

        // places 테이블에 데이터 삽입 (Upsert 로직)[cite: 2]
        const [placeResult] = await connection.execute(
          `INSERT INTO places (
            cid, name, summary, description, start_date, end_date, 
            api_created_at, api_updated_at, address, address_detail, 
            new_address, zip_code, latitude, longitude, traffic_info_subway, 
            telephone, website, website_lang, opening_hours, closed_days, 
            business_days, is_free_code, usage_fee, important_notes, 
            disabled_facility, images, main_image, tags, 
            category_path_ko, last_category_sn, is_indexed
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
          ON DUPLICATE KEY UPDATE 
            name=VALUES(name), description=VALUES(description), api_updated_at=VALUES(api_updated_at), is_indexed=0`,
          [
            item.cid,
            item.name,
            item.summary,
            item.description,
            sDate,
            eDate,
            item.created_at,
            item.updated_at,
            item.address_old,
            item.address_detail,
            item.address_new,
            item.zip_code,
            item.latitude,
            item.longitude,
            item.subway_info,
            item.telephone,
            item.website,
            JSON.stringify(websiteLangs),
            item.use_time,
            item.closed_days,
            item.business_days,
            item.fee_type,
            item.fee_guidance,
            item.important_info,
            JSON.stringify(item.disabled_facilities || []),
            JSON.stringify(item.relate_images || []),
            item.main_image,
            JSON.stringify(item.tags || []),
            item.category_path,
            item.last_category_sn,
          ],
        )

        // 생성된 id 가져오기
        let placeId = placeResult.insertId
        if (!placeId) {
          const [rows] = await connection.query(
            "SELECT id FROM places WHERE cid = ?",
            [item.cid],
          )
          placeId = rows[0].id
        }

        // 카테고리 매핑 테이블 데이터 주입[cite: 2]
        if (item.last_category_sn) {
          const [catRows] = await connection.query(
            "SELECT id FROM categories WHERE category_sn = ?",
            [item.last_category_sn],
          )
          if (catRows.length > 0) {
            await connection.execute(
              "INSERT IGNORE INTO place_category_mapping (place_id, category_id) VALUES (?, ?)",
              [placeId, catRows[0].id],
            )
          }
        }
      } catch (err) {
        console.error(`❌ CID ${item.cid} 실패:`, err.message)
      }
    }
    console.log("✅ 모든 데이터가 MySQL에 성공적으로 저장되었습니다!")
  } catch (error) {
    console.error("❌ 스크립트 실행 중 치명적 오류:", error)
  } finally {
    connection.release()
    process.exit()
  }
}

run()
