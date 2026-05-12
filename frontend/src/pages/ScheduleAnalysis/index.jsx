import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./scheduleAnalysis.css"
const API_URL = import.meta.env.VITE_API_URL || "/api"
const ScheduleAnalysis = () => {
  const { scheduleId } = useParams()
  const navigate = useNavigate()
  const lastFetchedScheduleId = useRef(null)

  const [schedule, setSchedule] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(
        `${API_URL}/schedules/${scheduleId}/analysis`,
        {
          credentials: "include",
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("AI 분석 응답 에러:", errorText)
        throw new Error("AI 분석 조회 실패")
      }

      const data = await response.json()

      setSchedule(data.schedule)
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("AI 분석 조회 실패:", error)
      alert("AI 분석 결과를 불러오는 중 문제가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!scheduleId) return

    if (lastFetchedScheduleId.current === scheduleId) {
      return
    }

    lastFetchedScheduleId.current = scheduleId
    fetchAnalysis()
  }, [scheduleId])

  const formatDate = (dateString) => {
    if (!dateString) return "-"

    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const scoreItems = [
    {
      key: "difficulty",
      label: "일정 난이도",
      value: analysis?.scores?.difficulty || 3,
    },
    {
      key: "moveBurden",
      label: "이동 부담",
      value: analysis?.scores?.moveBurden || 3,
    },
    {
      key: "outdoorRatio",
      label: "야외 비율",
      value: analysis?.scores?.outdoorRatio || 3,
    },
    {
      key: "relaxedLevel",
      label: "여유도",
      value: analysis?.scores?.relaxedLevel || 3,
    },
    {
      key: "recommendation",
      label: "추천도",
      value: analysis?.scores?.recommendation || 3,
    },
  ]

  const getCategoryLabel = (category) => {
    const categoryMap = {
      Museums: "박물관",
      Palaces: "궁궐",
      Rivers: "하천/산책",
      Places: "명소",
      Parks: "공원",
      Exhibitions: "전시",
      Libraries: "도서관",
      Culture: "문화공간",
    }

    return categoryMap[category] || category || "기타"
  }

  const getCategoryStats = (places) => {
    const categoryMap = {}

    places.forEach((place) => {
      const categories = place.category
        ? place.category.split(",").map((category) => category.trim())
        : ["기타"]

      categories.forEach((category) => {
        if (!category) return

        const categoryLabel = getCategoryLabel(category)

        categoryMap[categoryLabel] = (categoryMap[categoryLabel] || 0) + 1
      })
    })

    const total = Object.values(categoryMap).reduce(
      (sum, count) => sum + count,
      0,
    )

    return Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
    }))
  }

  const categoryStats = schedule ? getCategoryStats(schedule.places) : []

  if (isLoading) {
    return (
      <section className="analysis-page">
        <div className="container analysis-container">
          <div className="analysis-hero">
            <p className="analysis-eyebrow">AI TRAVEL FEEDBACK</p>
            <h1>AI 여행 일정 분석 중...</h1>
            <p>Ollama가 여행 일정을 분석하고 있습니다.</p>
          </div>
        </div>
      </section>
    )
  }

  if (!schedule || !analysis) {
    return (
      <section className="analysis-page">
        <div className="container analysis-container">
          <button
            type="button"
            className="analysis-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← 대시보드로 돌아가기
          </button>

          <div className="analysis-hero">
            <p className="analysis-eyebrow">AI TRAVEL FEEDBACK</p>
            <h1>분석 결과를 불러올 수 없습니다</h1>
            <p>잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="analysis-page">
      <div className="container analysis-container">
        <button
          type="button"
          className="analysis-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← 대시보드로 돌아가기
        </button>

        <div className="analysis-hero">
          <p className="analysis-eyebrow">AI TRAVEL FEEDBACK</p>
          <h1>AI 여행 일정 분석</h1>
          <p>저장한 여행 일정을 바탕으로 방문 흐름과 개선점을 확인해보세요.</p>
        </div>

        <section className="analysis-summary">
          <div>
            <span>일정 제목</span>
            <strong>{schedule.schedule_title}</strong>
          </div>

          <div>
            <span>여행 기간</span>
            <strong>
              {formatDate(schedule.start_date)} ~{" "}
              {formatDate(schedule.end_date)}
            </strong>
          </div>

          <div>
            <span>장소 수</span>
            <strong>{schedule.places.length}개</strong>
          </div>

          <div>
            <span>난이도</span>
            <strong>{analysis.difficulty}</strong>
          </div>
        </section>

        <div className="analysis-layout">
          <section className="analysis-card">
            <h2>여행 코스</h2>

            <ol className="analysis-timeline">
              {schedule.places.map((place, index) => (
                <li key={place.place_id} className="analysis-timeline-item">
                  <span className="timeline-number">{index + 1}</span>

                  <div>
                    <strong>{place.name}</strong>
                    <p>{place.address}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="analysis-card">
            <h2>일정 분석</h2>

            <div className="score-list">
              {scoreItems.map((score) => (
                <div className="score-row" key={score.key}>
                  <span className="score-label">{score.label}</span>

                  <div className="score-dots">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className={`score-dot ${
                          index < score.value ? "active" : ""
                        }`}
                      />
                    ))}
                  </div>

                  <strong className="score-value">{score.value}/5</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="analysis-card">
            <h2>여행 테마 비율</h2>

            <div className="category-chart">
              {categoryStats.map((category) => (
                <div className="category-chart-row" key={category.name}>
                  <span className="category-name">{category.name}</span>

                  <div className="category-bar-wrap">
                    <div
                      className="category-bar"
                      style={{ width: `${category.percent}%` }}
                    />
                  </div>

                  <strong>{category.percent}%</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="analysis-card analysis-order-card">
            <h2>AI 추천 코스</h2>

            <div className="order-compare">
              <div className="order-column">
                <h3>현재 여행 일정</h3>

                <ol>
                  {schedule.places.map((place, index) => (
                    <li key={place.place_id}>
                      <span>{index + 1}</span>
                      <strong>{place.name}</strong>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="order-column recommended">
                <h3>AI 추천 일정</h3>

                <ol>
                  {(analysis.recommendedOrder || []).map((place, index) => (
                    <li key={place.place_id || index}>
                      <span>{index + 1}</span>

                      <div>
                        <strong>{place.name}</strong>
                        <p>{place.reason}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section className="analysis-card analysis-feedback-card">
            <h2>AI 여행 코멘트</h2>

            <div className="feedback-block">
              <h3>일정 요약</h3>
              <p>{analysis.summary}</p>
            </div>

            <div className="feedback-block">
              <h3>동선 평가</h3>
              <p>{analysis.routeFeedback}</p>
            </div>

            <div className="feedback-block">
              <h3>좋은 점</h3>
              <ul>
                {(analysis.goodPoints || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-block">
              <h3>개선 추천</h3>
              <ul>
                {(analysis.improvements || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-block">
              <h3>추천 제목</h3>
              <ul>
                {(analysis.recommendedTitles || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

export default ScheduleAnalysis
