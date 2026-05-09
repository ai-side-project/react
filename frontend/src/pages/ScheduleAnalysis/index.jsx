import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./scheduleAnalysis.css";

const ScheduleAnalysis = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/schedules/${scheduleId}/analysis`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("AI 분석 조회 실패");
      }

      const data = await response.json();

      setSchedule(data.schedule);
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("AI 분석 조회 실패:", error);
      alert("AI 분석 결과를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [scheduleId]);

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
    );
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
    );
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
              {schedule.start_date} ~ {schedule.end_date}
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
            <h2>방문 순서 시각화</h2>

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
            <h2>AI 여행 피드백</h2>

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
  );
};

export default ScheduleAnalysis;
