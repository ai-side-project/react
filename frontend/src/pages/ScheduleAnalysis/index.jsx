import { useParams, useNavigate } from "react-router-dom";
import "./scheduleAnalysis.css";

const ScheduleAnalysis = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  const schedule = {
    schedule_title: "박물관 경복궁 청계천",
    start_date: "2026-05-09",
    end_date: "2026-05-10",
    places: [
      {
        place_id: 1,
        name: "국립고궁박물관",
        address: "서울 종로구 효자로 12",
      },
      {
        place_id: 2,
        name: "경복궁",
        address: "서울 종로구 사직로 161",
      },
      {
        place_id: 3,
        name: "청계천",
        address: "서울 종로구 무교로 37",
      },
    ],
  };

  const analysis = {
    summary: "역사와 문화 중심의 서울 여행 일정입니다.",
    routeFeedback: "종로권 장소가 많아 이동 부담이 낮은 편입니다.",
    difficulty: "보통",
    goodPoints: ["컨셉이 명확합니다.", "장소 구성이 자연스럽습니다."],
    improvements: [
      "야외 장소 방문 전 날씨를 확인하면 좋습니다.",
      "관람 시간이 긴 장소는 여유 시간을 확보하는 것이 좋습니다.",
    ],
    recommendedTitles: [
      "종로 역사문화 산책",
      "경복궁과 박물관 코스",
      "서울 전통문화 여행",
    ],
  };

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
                {analysis.goodPoints.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-block">
              <h3>개선 추천</h3>
              <ul>
                {analysis.improvements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-block">
              <h3>추천 제목</h3>
              <ul>
                {analysis.recommendedTitles.map((item, index) => (
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
