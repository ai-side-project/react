import { Link } from "react-router-dom";
import "./intro.css";

const featureItems = [
  {
    title: "숨은 명소 추천",
    desc: "서울의 숨은 명소와 문화재를 추천받고, 테마에 맞는 장소를 탐색할 수 있습니다.",
    icon: "🗺️",
  },
  {
    title: "AI 여행 일정 추천",
    desc: "사용자 취향과 이동 조건, 환경 데이터를 반영해 맞춤형 서울 여행 일정을 추천합니다.",
    icon: "🗓️",
  },
  {
    title: "공공데이터 기반 분석",
    desc: "날씨, 미세먼지, 혼잡도, 교통 정보 등을 반영해 상황에 맞는 여행 코스를 제안합니다.",
    icon: "📊",
  },
  {
    title: "여행일정 저장 및 관리",
    desc: "추천받은 여행 일정을 저장하고, 수정하거나 삭제하며 나만의 코스를 관리할 수 있습니다.",
    icon: "📝",
  },
];

const coursePreviewItems = [
  {
    time: "10:00",
    title: "숨은 문화유산 산책",
    desc: "조용한 문화재 코스",
    tags: ["문화유산", "조용한 곳"],
    icon: "↺",
  },
  {
    time: "11:30",
    title: "실내 문화 전시 공간",
    desc: "날씨를 반영한 실내 추천",
    tags: ["실내", "로컬"],
    icon: "▣",
  },
  {
    time: "13:00",
    title: "서울 골목 탐방 코스",
    desc: "도보로 즐기는 골목 코스",
    tags: ["도보", "숨은 명소"],
    icon: "⋯",
  },
];

const Intro = () => {
  return (
    <section className="intro-page">
      <div className="container intro-container">
        <section className="hero-section">
          <div className="hero-copy">
            <h1 className="hero-title">
              서울여행
              <br />
              <span>플래너 AI</span>
            </h1>

            <p className="hero-desc">
              유명 관광지 너머의 서울을 발견할 수 있도록
              <br />
              숨은 명소와 문화재를 기반으로
              <br />
              맞춤형 여행 일정을 추천하는 서비스입니다.
            </p>
            <div className="hero-actions">
              <Link to="/home" className="hero-btn hero-btn-primary">
                홈으로 가기
              </Link>
            </div>
          </div>

          <div className="hero-preview-card course-preview-card">
            <div className="course-preview-header">
              <div className="course-preview-title-wrap">
                <div className="course-preview-icon">✦</div>
                <span className="course-preview-title">
                  AI 추천 코스 미리보기
                </span>
              </div>
              <div className="course-preview-pill">맞춤 일정</div>
            </div>

            <div className="course-preview-body">
              <div className="course-route-line" />

              <div className="course-timeline">
                {coursePreviewItems.map((item) => (
                  <div key={item.time} className="course-stop">
                    <span className="course-time">{item.time}</span>

                    <div className="course-node-wrap">
                      <div className="course-node">
                        <span>{item.icon}</span>
                      </div>
                    </div>

                    <div className="course-node-connector" />

                    <h3 className="course-stop-title">{item.title}</h3>
                    <p className="course-stop-desc">{item.desc}</p>

                    <div className="course-tag-list">
                      {item.tags.map((tag) => (
                        <span key={tag} className="course-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="course-summary-row">
              <div className="course-summary-item">
                <span className="course-summary-dot" />
                <strong>12+ 추천 일정</strong>
              </div>
              <div className="course-summary-item">
                <span className="course-summary-dot" />
                <strong>240+ 숨은 명소</strong>
              </div>
              <div className="course-summary-item">
                <span className="course-summary-dot" />
                <strong>80+ 문화유산 정보</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-heading">
            <h2>주요 기능</h2>
            <p>
              공공데이터와 AI를 활용해 서울의 숨은 명소와 문화재를 추천하고,
              사용자 맞춤형 여행 일정을 제공합니다.
            </p>
          </div>

          <div className="feature-grid">
            {featureItems.map((item) => (
              <article key={item.title} className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Intro;
