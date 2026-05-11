import { Link } from "react-router-dom";
import "./intro.css";

const featureItems = [
  {
    title: "여행지 검색",
    desc: "서울의 관광지, 문화공간, 음식점 등 다양한 장소를 확인할 수 있습니다..",
    icon: "🗺️",
  },
  {
    title: "여행지 즐겨찾기",
    desc: "마음에 드는 여행지를 하트로 저장하고, 나만의 여행 코스에 활용할 수 있습니다.",
    icon: "❤️",
  },
  {
    title: "여행 코스 생성",
    desc: "저장한 여행지를 선택해 방문 순서와 날짜를 정하고 여행 일정을 만들 수 있습니다..",
    icon: "📅",
  },
  {
    title: "AI 일정 분석",
    desc: "생성한 여행 일정을 바탕으로 동선, 난이도, 추천 순서와 개선점을 확인할 수 있습니다.",
    icon: "📝",
  },
];

const Intro = () => {
  return (
    <section className="intro-page">
      <div className="container intro-container">
        <section className="hero-section">
          <div className="hero-copy">
            <h1 className="hero-title">
              길벗 <span>AI</span>
            </h1>

            <p className="hero-desc">
              여행지 검색부터 코스 생성, AI 일정 분석까지.
              <br />
              길벗 AI와 함께 나만의 서울 여행 일정을
              <br />더 쉽고 똑똑하게 만들어보세요.
            </p>
            <div className="hero-actions">
              <Link to="/search" className="hero-btn hero-btn-primary">
                여행지 검색하기
              </Link>
            </div>
          </div>

          <div className="course-preview-card">
            <div className="course-preview-header">
              <div className="course-preview-title-wrap">
                <div className="course-preview-icon">✦</div>
                <div className="course-preview-title">
                  AI 일정 분석 미리보기
                </div>
              </div>
              <div className="course-preview-pill">분석 예시</div>
            </div>

            <div className="course-preview-body">
              <div className="course-timeline">
                <div className="course-stop">
                  <div className="course-time">STEP 1</div>
                  <div className="course-node-wrap">
                    <div className="course-node">♡</div>
                  </div>
                  <div className="course-node-connector" />
                  <h3 className="course-stop-title">여행지 저장</h3>
                  <p className="course-stop-desc">
                    마음에 드는 장소를 하트로 저장
                  </p>
                  <div className="course-tag-list">
                    <span className="course-tag">즐겨찾기</span>
                    <span className="course-tag">장소 선택</span>
                  </div>
                </div>

                <div className="course-stop">
                  <div className="course-time">STEP 2</div>
                  <div className="course-node-wrap">
                    <div className="course-node">＋</div>
                  </div>
                  <div className="course-node-connector" />
                  <h3 className="course-stop-title">코스 생성</h3>
                  <p className="course-stop-desc">
                    저장한 장소로 여행 일정 구성
                  </p>
                  <div className="course-tag-list">
                    <span className="course-tag">방문 순서</span>
                    <span className="course-tag">일정 저장</span>
                  </div>
                </div>

                <div className="course-stop">
                  <div className="course-time">STEP 3</div>
                  <div className="course-node-wrap">
                    <div className="course-node">AI</div>
                  </div>
                  <div className="course-node-connector" />
                  <h3 className="course-stop-title">AI 분석</h3>
                  <p className="course-stop-desc">
                    동선과 개선점을 한눈에 확인
                  </p>
                  <div className="course-tag-list">
                    <span className="course-tag">추천 순서</span>
                    <span className="course-tag">코스 분석</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="course-summary-row">
              <div className="course-summary-item">
                <span className="course-summary-dot" />
                <strong>동선 평가</strong>
              </div>
              <div className="course-summary-item">
                <span className="course-summary-dot" />
                <strong>추천 순서</strong>
              </div>
              <div className="course-summary-item">
                <span className="course-summary-dot" />
                <strong>개선 포인트</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-heading">
            <h2>주요 기능</h2>
            <p>
              여행지 검색부터 코스 생성, AI 일정 분석까지 한 번에 도와주는 서울
              여행 플래너입니다.
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
