import { Link } from "react-router-dom";
import "./intro.css";

const featureItems = [
  {
    title: "주식 추세 분석",
    desc: "과거 가격과 거래량을 정리해 시장의 주요 추세와 패턴을 직관적으로 확인할 수 있습니다.",
    icon: "📈",
  },
  {
    title: "AI 예측 결과",
    desc: "머신러닝 모델이 분석한 예측 결과와 신뢰도 지표를 빠르게 확인할 수 있습니다.",
    icon: "〰️",
  },
  {
    title: "시장 데이터 시각화",
    desc: "시세, 지표, 뉴스 요약을 카드와 차트 형태로 정리해 한눈에 볼 수 있도록 구성했습니다.",
    icon: "📊",
  },
  {
    title: "커뮤니티 보드",
    desc: "자유게시판과 종목별 게시판을 통해 예측 결과에 대한 의견과 정보를 함께 공유할 수 있습니다.",
    icon: "👥",
  },
];

const Intro = () => {
  return (
    <section className="intro-page">
      <div className="container intro-container">
        <section className="hero-section">
          <div className="hero-copy">
            <h1 className="hero-title">
              AI 기반 주식 분석 및
              <br />
              <span>예측 플랫폼</span>
            </h1>

            <p className="hero-desc">
              AI와 시장 데이터를 기반으로 주가 흐름을
              <br />
              분석하고 예측 결과를 한눈에 확인할 수 있는
              <br />
              포트폴리오 플랫폼입니다.
            </p>
          </div>

          <div className="hero-preview-card">
            <div className="preview-top">
              <span className="preview-dot" />
              <span className="preview-label">MARKET PREVIEW</span>
              <span className="preview-status">REAL-TIME</span>
            </div>

            <div className="preview-chart">
              <div className="preview-grid-lines">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="preview-x-axis">
                <span>09:00</span>
                <span>10:30</span>
                <span>11:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>15:00</span>
              </div>

              <svg
                className="preview-line"
                viewBox="0 0 520 220"
                preserveAspectRatio="none"
              >
                <path
                  d="M20 190 C70 110, 120 120, 160 165 S240 190, 290 110 S370 40, 420 90 S470 150, 500 20"
                  fill="none"
                  stroke="#4d9cff"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="preview-stat-row">
              <div className="preview-stat-card">
                <span>예측 정확도</span>
                <strong>94.2%</strong>
              </div>
              <div className="preview-stat-card">
                <span>분석 종목 수</span>
                <strong>2,400+</strong>
              </div>
              <div className="preview-stat-card">
                <span>예측 리포트 수</span>
                <strong>12건</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-heading">
            <h2>주요 기능</h2>
            <p>
              방대한 시장 데이터와 정교한 알고리즘을 결합하여 투자 의사결정에
              필요한 핵심 인사이트를 제공합니다.
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
