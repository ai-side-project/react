import { useMemo, useState } from "react";
import "./home.css";

const CATEGORIES = [
  "공원·자연",
  "문화유산·역사",
  "전시·박물관",
  "문화공간·복합공간",
  "전망·랜드마크",
  "체험·놀이",
];

const createMockImage = (label, color) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="100%" stop-color="#f8fafc" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#bg)" />
      <circle cx="540" cy="88" r="54" fill="rgba(255,255,255,0.48)" />
      <circle cx="112" cy="304" r="88" fill="rgba(255,255,255,0.3)" />
      <rect x="44" y="248" width="552" height="108" rx="24" fill="rgba(255,255,255,0.66)" />
      <text x="50%" y="46%" text-anchor="middle" fill="#0f172a" font-size="38" font-weight="700" font-family="Arial, sans-serif">${label}</text>
      <text x="50%" y="59%" text-anchor="middle" fill="#334155" font-size="18" font-weight="500" font-family="Arial, sans-serif">Seoul Travel Spot</text>
    </svg>
  `)}`;

const MOCK_PLACES = [
  {
    id: 1,
    name: "서울숲",
    category: "공원·자연",
    summary: "도심 속 숲길과 잔디광장을 여유롭게 즐길 수 있는 대표 공원입니다.",
    image_url: createMockImage("서울숲", "#d9f99d"),
  },
  {
    id: 2,
    name: "북한산국립공원",
    category: "공원·자연",
    summary: "가벼운 산책부터 본격 등산까지 가능한 서울 대표 자연 명소입니다.",
    image_url: createMockImage("북한산국립공원", "#bbf7d0"),
  },
  {
    id: 3,
    name: "경복궁",
    category: "문화유산·역사",
    summary:
      "조선 왕조의 중심 궁궐로 계절마다 다른 풍경을 보여주는 역사 공간입니다.",
    image_url: createMockImage("경복궁", "#fde68a"),
  },
  {
    id: 4,
    name: "창덕궁",
    category: "문화유산·역사",
    summary: "고즈넉한 궁궐 산책과 후원 관람이 매력적인 문화유산입니다.",
    image_url: createMockImage("창덕궁", "#fdba74"),
  },
  {
    id: 5,
    name: "국립중앙박물관",
    category: "전시·박물관",
    summary: "한국 역사와 문화를 한 번에 살펴볼 수 있는 대형 박물관입니다.",
    image_url: createMockImage("국립중앙박물관", "#bfdbfe"),
  },
  {
    id: 6,
    name: "서울시립미술관",
    category: "전시·박물관",
    summary: "고전 건물과 현대 전시가 어우러진 서울 도심 미술관입니다.",
    image_url: createMockImage("서울시립미술관", "#c4b5fd"),
  },
  {
    id: 7,
    name: "성수동 복합문화공간",
    category: "문화공간·복합공간",
    summary: "전시, 카페, 편집숍이 모여 있어 천천히 둘러보기 좋은 공간입니다.",
    image_url: createMockImage("성수동 복합문화공간", "#ddd6fe"),
  },
  {
    id: 8,
    name: "동대문디자인플라자",
    category: "문화공간·복합공간",
    summary:
      "전시와 이벤트, 야간 산책이 모두 가능한 서울의 대표 복합공간입니다.",
    image_url: createMockImage("동대문디자인플라자", "#fbcfe8"),
  },
  {
    id: 9,
    name: "N서울타워",
    category: "전망·랜드마크",
    summary: "서울 전경을 한눈에 볼 수 있는 대표 전망 랜드마크입니다.",
    image_url: createMockImage("N서울타워", "#fecaca"),
  },
  {
    id: 10,
    name: "롯데월드타워 전망대",
    category: "전망·랜드마크",
    summary: "고층 전망대에서 도시 풍경을 시원하게 감상할 수 있습니다.",
    image_url: createMockImage("롯데월드타워 전망대", "#fed7aa"),
  },
  {
    id: 11,
    name: "롯데월드 어드벤처",
    category: "체험·놀이",
    summary: "실내외 어트랙션을 함께 즐길 수 있는 대표 체험형 여행지입니다.",
    image_url: createMockImage("롯데월드 어드벤처", "#f9a8d4"),
  },
  {
    id: 12,
    name: "서울랜드",
    category: "체험·놀이",
    summary:
      "가족과 함께 즐기기 좋은 놀이기구와 시즌 이벤트가 준비된 공간입니다.",
    image_url: createMockImage("서울랜드", "#f5d0fe"),
  },
];

const Home = () => {
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState("");

  const placeCountText = useMemo(
    () => `${MOCK_PLACES.length}개의 mock 여행지를 검색할 수 있습니다.`,
    [],
  );

  const handleKeywordSearch = () => {
    const trimmedKeyword = keyword.trim();
    setActiveCategory("");
    setSearchMode("keyword");
    setHasSearched(true);

    if (!trimmedKeyword) {
      setResults([]);
      return;
    }

    const filteredPlaces = MOCK_PLACES.filter((place) =>
      place.name.toLowerCase().includes(trimmedKeyword.toLowerCase()),
    );

    setResults(filteredPlaces);
  };

  const handleCategorySearch = (category) => {
    setKeyword("");
    setActiveCategory(category);
    setSearchMode("category");
    setHasSearched(true);

    const filteredPlaces = MOCK_PLACES.filter(
      (place) => place.category === category,
    );

    setResults(filteredPlaces);
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
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="place-image"
                  />
                  <div className="place-content">
                    <span className="place-category">{place.category}</span>
                    <h3>{place.name}</h3>
                    <p>{place.summary}</p>
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
