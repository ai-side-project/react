import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./detail.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const instance = axios.create({
  withCredentials: true,
});

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await instance.get(`${API_URL}/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        console.error("게시글 상세 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleBack = () => {
    navigate("/board");
  };

  const handleEdit = () => {
    console.log("수정");
  };

  const handleDelete = () => {
    console.log("삭제");
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    console.log("댓글 등록");
  };

  if (loading) {
    return <div className="detail-page">로딩 중...</div>;
  }

  if (!post) {
    return <div className="detail-page">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="detail-page">
      <div className="detail-container">
        <div className="post-card">
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <span className="meta-item">
                작성자: <strong>{post.nickname}</strong>
              </span>
              <span className="meta-item">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="meta-item">조회수: {post.views ?? 0}</span>
            </div>
          </header>

          <article className="post-content">
            <p>{post.content}</p>
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
              <li className="comment-item">
                <p className="comment-text">아직 댓글이 없습니다.</p>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Detail;
