import { useState } from "react";
import { Link } from "react-router-dom";
import "./board.css";

const categories = ["자유게시판", "삼성전자", "SK하이닉스", "카카오"];

const dummyPosts = [
  {
    id: 1,
    title: "삼성전자 흐름이 다시 살아나는 것 같아요",
    author: "apple",
    date: "2026.03.31",
    views: 128,
    likes: 7,
    category: "자유게시판",
  },
];

const Board = () => {
  const [selectedCategory, setSelectedCategory] = useState("자유게시판");
  const [searchType, setSearchType] = useState("title");
  const [inputKeyword, setInputKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const POSTS_PER_PAGE = 5;

  const categoryFilteredPosts = dummyPosts.filter(
    (post) => post.category === selectedCategory,
  );

  const searchedPosts = categoryFilteredPosts.filter((post) => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return true;

    if (searchType === "title") {
      return post.title.toLowerCase().includes(keyword);
    }

    if (searchType === "author") {
      return post.author.toLowerCase().includes(keyword);
    }

    return true;
  });

  const totalPages = Math.ceil(searchedPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = searchedPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE,
  );

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setInputKeyword("");
    setSearchKeyword("");
  };

  const handleSearch = () => {
    setSearchKeyword(inputKeyword);
    setCurrentPage(1);
  };

  const handleWrite = () => {
    alert("나중에 글쓰기 페이지 연결");
  };

  return (
    <section className="board-page">
      <div className="container board-container">
        <div className="board-page-header">
          <h1>종목토론방</h1>
        </div>

        <div className="board-layout">
          <aside className="board-sidebar board-card">
            <span className="board-sidebar-label">카테고리</span>

            <div className="board-category-list">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    selectedCategory === category
                      ? "board-category-btn active"
                      : "board-category-btn"
                  }
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </aside>

          <div className="board-content board-card">
            <div className="board-content-top">
              <h2>{selectedCategory}</h2>
            </div>

            <div className="board-table-wrap">
              <table className="board-table">
                <thead>
                  <tr>
                    <th className="col-id">번호</th>
                    <th className="col-title">제목</th>
                    <th className="col-author">작성자</th>
                    <th className="col-date">날짜</th>
                    <th className="col-views">조회수</th>
                    <th className="col-likes">추천</th>
                  </tr>
                </thead>

                <tbody>
                  {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                      <tr key={post.id}>
                        <td>{post.id}</td>
                        <td className="board-title-cell">
                          <Link to="/board/detail" className="board-title-link">
                            {post.title}
                          </Link>
                        </td>
                        <td>{post.author}</td>
                        <td>{post.date}</td>
                        <td>{post.views}</td>
                        <td>{post.likes}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="board-empty">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="board-search-row">
              <div className="board-search-controls">
                <select
                  className="board-search-select"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="title">제목</option>
                  <option value="author">작성자</option>
                </select>

                <div className="board-search-input-wrap">
                  <input
                    type="text"
                    className="board-search-input"
                    placeholder="검색어를 입력하세요"
                    value={inputKeyword}
                    onChange={(e) => setInputKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />

                  <button
                    type="button"
                    className="board-search-icon-btn"
                    onClick={handleSearch}
                    aria-label="검색"
                  >
                    🔍
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="board-write-btn"
                onClick={handleWrite}
              >
                글쓰기
              </button>
            </div>

            <div className="board-pagination">
              {Array.from({ length: totalPages || 1 }, (_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    className={
                      currentPage === pageNumber
                        ? "page-btn active"
                        : "page-btn"
                    }
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Board;
