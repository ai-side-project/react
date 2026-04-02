import React from "react";
import { useNavigate } from "react-router-dom";
import "./detail.css";

const Detail = () => {
  const post = {
    title: "[분석] 삼성전자, 올해 실적과 기술적 관점에서의 지지·저항 레벨",
    author: "분석가A",
    date: "2026.04.02",
    views: "1,234",
    content: [
      "본 글은 삼성전자의 최근 실적 발표와 기술적 지표를 바탕으로 향후 주가 흐름을 예측하는 내용입니다. 아래 내용은 교육용 예시 텍스트입니다.",
      "요약: 최근 분기 실적은 컨센서스에 부합하였고, 거래량 확대에 따라 단기 상승 모멘텀이 확인됩니다. 그러나 장기 추세를 판단하기 위해서는 주요 지지선의 유지 여부가 중요합니다.",
      "기술적 분석: 이동평균선의 정렬은 단기적으로 긍정적이며, MACD 히스토그램이 양수 전환을 시도하고 있습니다. 주요 저항은 80,000원 대 초반, 지지는 70,000원 대에서 확인됩니다.",
      "(본문 예시 텍스트가 더 들어갑니다. 실제 게시글에서는 여러 문단으로 구성되어 가독성이 좋게 보입니다.)",
    ],
  };

  const sampleComments = [
    {
      id: 1,
      author: "홍길동",
      date: "2026.04.01",
      text: "유익한 분석 감사합니다. 특히 거래량 해석이 인상적이네요.",
    },
    {
      id: 2,
      author: "김연수",
      date: "2026.03.30",
      text: "추세선 설명 부분이 이해하기 쉬웠습니다. 다음 포스트도 기대합니다.",
    },
  ];

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/board");
  };
  const handleEdit = () => console.log("수정");
  const handleDelete = () => console.log("삭제");
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    console.log("댓글 등록");
  };

  return (
    <div className="detail-page">
      <div className="detail-container">
        <div className="post-card">
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <span className="meta-item">
                작성자: <strong>{post.author}</strong>
              </span>
              <span className="meta-item">{post.date}</span>
              <span className="meta-item">조회수: {post.views}</span>
            </div>
          </header>

          <article className="post-content">
            {post.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}

            <h3>기술적 포인트</h3>
            <p>
              단기 지지선과 저항선을 중심으로 매매 전략을 검토하십시오. 이
              문단은 예시 텍스트입니다.
            </p>
          </article>

          <div className="post-actions">
            <div className="left-actions">
              <button className="btn btn-primary" onClick={handleBack}>
                목록으로
              </button>
            </div>

            <div className="right-actions">
              <button className="btn btn-outline" onClick={handleEdit}>
                수정
              </button>
              <button className="btn btn-ghost" onClick={handleDelete}>
                삭제
              </button>
            </div>
          </div>

          <section className="comments-section">
            <h2 className="comments-title">댓글</h2>

            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                className="comment-input"
                placeholder="댓글을 입력하세요"
                rows="3"
              />
              <button type="submit" className="btn btn-outline small">
                등록
              </button>
            </form>

            <ul className="comment-list">
              {sampleComments.map((c) => (
                <li key={c.id} className="comment-item">
                  <div className="comment-meta">
                    <span className="comment-author">{c.author}</span>
                    <span className="comment-date">{c.date}</span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Detail;
