import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./board.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const instance = axios.create({
  withCredentials: true,
});

const Board = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await instance.get(`${API_URL}/posts`);
        setPosts(response.data);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="board-loading">로딩 중...</div>;
  }

  return (
    <section className="board-page">
      <div className="container board-container">
        <div className="board-page-header">
          <h1>종목토론방</h1>
        </div>

        <div className="board-content board-card">
          <div className="board-content-top">
            <h2>전체 게시글</h2>
          </div>

          <div className="board-table-wrap">
            <table className="board-table">
              <thead>
                <tr>
                  <th className="col-id">번호</th>
                  <th className="col-title">제목</th>
                  <th className="col-author">작성자</th>
                  <th className="col-date">날짜</th>
                </tr>
              </thead>

              <tbody>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post.id}>
                      <td>{post.id}</td>
                      <td className="board-title-cell">
                        <Link
                          to={`/board/${post.id}`}
                          className="board-title-link"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td>{post.nickname}</td>
                      <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="board-empty">
                      게시글이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="board-bottom-row">
            <button
              type="button"
              className="board-write-btn"
              onClick={() => alert("글쓰기 페이지는 나중에 연결")}
            >
              글쓰기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Board;
