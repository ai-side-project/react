import { useState } from "react";
import "./home.css";

const CATEGORIES = [
  "공원·자연",
  "문화유산·역사",
  "전시·박물관",
  "문화공간·복합공간",
  "전망·랜드마크",
  "체험·놀이",
];

const Home = () => {
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState("");

  const handleKeywordSearch = async () => {
    const trimmedKeyword = keyword.trim();

    setActiveCategory("");
    setSearchMode("keyword");
    setHasSearched(true);

    if (!trimmedKeyword) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/home/search?keyword=${encodeURIComponent(
          trimmedKeyword,
        )}`,
      );

      if (!response.ok) {
        throw new Error("검색 API 요청 실패");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("검색 실패:", error);
      setResults([]);
    }
  };

  const handleCategorySearch = async (category) => {
    setKeyword("");
    setActiveCategory(category);
    setSearchMode("category");
    setHasSearched(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/home/category?category=${encodeURIComponent(
          category,
        )}`,
      );

      if (!response.ok) {
        throw new Error("카테고리 검색 API 요청 실패");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("카테고리 검색 실패:", error);
      setResults([]);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setActiveCategory("");
    setResults([]);
    setHasSearched(false);
    setSearchMode("");
  };

  const handleKeywordKeyDown = (event) => {
    if (event.key === "Enter") {
      handleKeywordSearch();
    }
  };

  const renderStatusText = () => {
    if (!hasSearched) {
      return "장소명을 입력하거나 아래 카테고리를 선택해 여행지를 찾아보세요.";
    }

    if (searchMode === "keyword") {
      return keyword.trim()
        ? `'${keyword.trim()}' 검색 결과입니다.`
        : "검색어를 입력하면 장소명 기준으로 결과를 확인할 수 있습니다.";
    }

    if (searchMode === "category" && activeCategory) {
      return `'${activeCategory}' 카테고리 결과입니다.`;
    }

    return "검색 결과를 확인해보세요.";
  };

  return (
    <section className="home-page">
      <div className="container home-container">
        <div className="home-hero">
          <div className="home-copy">
            <p className="home-eyebrow">SEOUL TRAVEL SPOT SEARCH</p>
            <h1>서울 여행 스팟 찾기</h1>
            <p className="home-description">
              찾고 싶은 여행지를 검색하거나 아래 카테고리에서 바로 둘러보세요.
            </p>
          </div>
        </div>

        <section className="search-panel">
          <div className="search-box">
            <label className="search-label" htmlFor="place-search-input">
              장소명 검색
            </label>
            <div className="search-controls">
              <input
                id="place-search-input"
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="예: 경복궁, 서울숲, N서울타워"
                className="search-input"
              />
              <button
                type="button"
                className="search-button"
                onClick={handleKeywordSearch}
              >
                검색
              </button>
            </div>
          </div>

          <div className="category-section">
            <div className="category-header">
              <h2>카테고리 검색</h2>
              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
              >
                초기화
              </button>
            </div>

            <div className="category-grid">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`category-button ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => handleCategorySearch(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="results-section">
          <div className="results-header">
            <div>
              <h2>검색 결과</h2>
              <p>{renderStatusText()}</p>
            </div>
            {hasSearched && results.length > 0 ? (
              <span className="results-count">{results.length}건</span>
            ) : null}
          </div>

          {!hasSearched ? (
            <div className="results-empty">
              <strong>아직 검색하지 않았습니다.</strong>
              <p>장소명 검색 또는 카테고리 버튼을 눌러 결과를 확인해보세요.</p>
            </div>
          ) : null}

          {hasSearched && results.length === 0 ? (
            <div className="results-empty">
              <strong>검색 결과가 없습니다.</strong>
              <p>다른 장소명을 입력하거나 다른 카테고리를 선택해보세요.</p>
            </div>
          ) : null}

          {hasSearched && results.length > 0 ? (
            <div className="results-grid">
              {results.map((place) => (
                <article key={place.id} className="place-card">
                  <div className="place-content">
                    <h3>{place.name}</h3>
                    <p>{place.road_address || place.address}</p>
                    <p>{place.description}</p>
                    {place.opening_hours ? (
                      <p>운영시간: {place.opening_hours}</p>
                    ) : null}
                    {place.telephone ? (
                      <p>전화번호: {place.telephone}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
};

export default Home;
