import { useEffect, useState } from "react"
import "./home.css"

const CATEGORIES = [
  "공원·자연",
  "문화유산·역사",
  "전시·박물관",
  "문화공간·복합공간",
  "전망·랜드마크",
  "체험·놀이",
  "야경",
]

const IMAGE_BASE_URL = "http://localhost:5000/img"

const Home = () => {
  const [keyword, setKeyword] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchMode, setSearchMode] = useState("")
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [favoriteIds, setFavoriteIds] = useState([])

  const ITEMS_PER_PAGE = 6

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleKeywordSearch = async () => {
    const trimmedKeyword = keyword.trim()

    setActiveCategory("")
    setSearchMode("keyword")
    setHasSearched(true)
    setCurrentPage(1)

    if (!trimmedKeyword) {
      setResults([])
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/home/search?keyword=${encodeURIComponent(
          trimmedKeyword,
        )}`,
      )

      if (!response.ok) {
        throw new Error("검색 API 요청 실패")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("검색 실패:", error)
      setResults([])
    }
  }

  const handleCategorySearch = async (category) => {
    setKeyword("")
    setActiveCategory(category)
    setSearchMode("category")
    setHasSearched(true)
    setCurrentPage(1)

    try {
      const response = await fetch(
        `http://localhost:5000/api/home/category?category=${encodeURIComponent(
          category,
        )}`,
      )

      if (!response.ok) {
        throw new Error("카테고리 검색 API 요청 실패")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("카테고리 검색 실패:", error)
      setResults([])
    }
  }

  const handlePlaceClick = async (placeId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/home/places/${placeId}`,
      )

      if (!response.ok) {
        throw new Error("장소 상세 조회 실패")
      }

      const data = await response.json()

      setSelectedImages(data.images)
      setIsModalOpen(true)
      setSelectedPlace(data.place)
    } catch (error) {
      console.error("장소 상세 조회 실패:", error)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlace(null)
    setSelectedImages([])
  }

  const handleReset = () => {
    setKeyword("")
    setActiveCategory("")
    setResults([])
    setHasSearched(false)
    setSearchMode("")
    setCurrentPage(1)
  }

  const handleKeywordKeyDown = (event) => {
    if (event.key === "Enter") {
      handleKeywordSearch()
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/favorites", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("즐겨찾기 목록 조회 실패")
      }

      const data = await response.json()
      setFavoriteIds(data.map((place) => place.id))
    } catch (error) {
      console.error("즐겨찾기 목록 조회 실패:", error)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const handleToggleFavorite = async (place) => {
    const isFavorite = favoriteIds.includes(place.id)

    try {
      const response = await fetch(
        `http://localhost:5000/api/favorites/${place.id}`,
        {
          method: isFavorite ? "DELETE" : "POST",
          credentials: "include",
        },
      )

      if (!response.ok) {
        throw new Error("즐겨찾기 처리 실패")
      }

      if (isFavorite) {
        setFavoriteIds((prev) => prev.filter((id) => id !== place.id))
      } else {
        setFavoriteIds((prev) => [...prev, place.id])
      }
    } catch (error) {
      console.error("즐겨찾기 처리 실패:", error)
      alert("즐겨찾기 처리 중 문제가 발생했습니다.")
    }
  }

  const renderStatusText = () => {
    if (!hasSearched) {
      return "장소명을 입력하거나 아래 카테고리를 선택해 여행지를 찾아보세요."
    }

    if (searchMode === "keyword") {
      return keyword.trim()
        ? `'${keyword.trim()}' 검색 결과입니다.`
        : "검색어를 입력하면 장소명 기준으로 결과를 확인할 수 있습니다."
    }

    if (searchMode === "category" && activeCategory) {
      return `'${activeCategory}' 카테고리 결과입니다.`
    }

    return "검색 결과를 확인해보세요."
  }
  return (
    <section className="home-page">
      <div className="container home-container">
        {/* 헤더 섹션 */}
        <div className="home-hero">
          <div className="home-copy">
            <p className="home-eyebrow">SEOUL TRAVEL SPOT SEARCH</p>
            <h1>서울 여행 스팟 찾기</h1>
            <p className="home-description">
              찾고 싶은 여행지를 검색하거나 아래 카테고리에서 바로 둘러보세요.
            </p>
          </div>
        </div>

        {/* 검색 패널 */}
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
                onChange={(e) => setKeyword(e.target.value)}
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
                  className={`category-button ${activeCategory === category ? "active" : ""}`}
                  onClick={() => handleCategorySearch(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 결과 섹션 */}
        <section className="results-section">
          <div className="results-header">
            <div>
              <h2>검색 결과</h2>
              <p>{renderStatusText()}</p>
            </div>
            {hasSearched && results.length > 0 && (
              <span className="results-count">{results.length}건</span>
            )}
          </div>

          {!hasSearched && (
            <div className="results-empty">
              <strong>아직 검색하지 않았습니다.</strong>
              <p>장소명 검색 또는 카테고리 버튼을 눌러 결과를 확인해보세요.</p>
            </div>
          )}

          {hasSearched && results.length === 0 && (
            <div className="results-empty">
              <strong>검색 결과가 없습니다.</strong>
              <p>다른 장소명을 입력하거나 다른 카테고리를 선택해보세요.</p>
            </div>
          )}

          {hasSearched && results.length > 0 && (
            <>
              <div className="results-grid">
                {currentResults.map((place) => (
                  <article
                    key={place.id}
                    className="place-card"
                    onClick={() => handlePlaceClick(place.id)}
                  >
                    <div className="place-image-wrap">
                      <img
                        src={
                          place.main_image
                            ? place.main_image.startsWith("http")
                              ? place.main_image
                              : `${IMAGE_BASE_URL}/${place.main_image}`
                            : "/images/default-place-image.png"
                        }
                        alt={place.name}
                        className="place-image"
                        onError={(e) => {
                          e.target.src = "/images/default-place-image.png"
                        }}
                      />
                      <button
                        type="button"
                        className={`favorite-button ${favoriteIds.includes(place.id) ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(place)
                        }}
                      >
                        {favoriteIds.includes(place.id) ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="place-content">
                      <h3>{place.name}</h3>
                      {/* [수정] road_address -> new_address */}
                      <p className="place-address">
                        {place.new_address || place.address || "주소 정보 없음"}
                      </p>
                      <p className="place-description">
                        {place.summary || place.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {/* 페이지네이션 (생략 가능하면 유지) */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                  >
                    이전
                  </button>
                  {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.floor((currentPage - 1) / 10) * 10 + i + 1
                    return pageNum <= totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "active" : ""}
                      >
                        {pageNum}
                      </button>
                    ) : null
                  })}
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* 상세 모달 */}
        {isModalOpen && selectedPlace && (
          <div className="place-modal-backdrop" onClick={handleCloseModal}>
            <div className="place-modal" onClick={(e) => e.stopPropagation()}>
              <button className="place-modal-close" onClick={handleCloseModal}>
                ×
              </button>

              <div className="place-modal-images">
                {selectedImages && selectedImages.length > 0 ? (
                  selectedImages.map((img) => (
                    <img
                      key={img.id}
                      src={
                        img.url.startsWith("http")
                          ? img.url
                          : `${IMAGE_BASE_URL}/${img.url}`
                      }
                      alt={selectedPlace.name}
                      className="place-modal-image"
                    />
                  ))
                ) : (
                  <img
                    src="/images/default-place-image.png"
                    alt="이미지 준비중"
                    className="place-modal-image"
                  />
                )}
              </div>

              <div className="place-modal-content">
                <h2>{selectedPlace.name}</h2>
                {selectedPlace.description && (
                  <p className="place-modal-description">
                    {selectedPlace.description}
                  </p>
                )}

                <dl className="place-detail-list">
                  <div>
                    <dt>주소</dt>
                    <dd>{selectedPlace.address || "-"}</dd>
                  </div>
                  {/* [수정] new_address 적용 */}
                  <div>
                    <dt>신주소</dt>
                    <dd>{selectedPlace.new_address || "-"}</dd>
                  </div>
                  <div>
                    <dt>전화번호</dt>
                    <dd>{selectedPlace.telephone || "-"}</dd>
                  </div>
                  <div>
                    <dt>웹사이트</dt>
                    <dd>
                      {selectedPlace.website ? (
                        <a
                          href={selectedPlace.website}
                          target="_blank"
                          rel="noreferrer"
                        >
                          바로가기
                        </a>
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>운영시간</dt>
                    <dd>{selectedPlace.opening_hours || "-"}</dd>
                  </div>
                  {/* [수정] business_days 적용[cite: 1] */}
                  <div>
                    <dt>운영요일</dt>
                    <dd>{selectedPlace.business_days || "-"}</dd>
                  </div>
                  <div>
                    <dt>휴무일</dt>
                    <dd>{selectedPlace.closed_days || "-"}</dd>
                  </div>
                  {/* [추가] 무장애 정보[cite: 1] */}
                  <div>
                    <dt>편의시설</dt>
                    <dd>
                      {selectedPlace.disabled_facility &&
                      selectedPlace.disabled_facility.length > 0
                        ? selectedPlace.disabled_facility.join(", ")
                        : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt>지하철</dt>
                    <dd>{selectedPlace.traffic_info_subway || "-"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Home
