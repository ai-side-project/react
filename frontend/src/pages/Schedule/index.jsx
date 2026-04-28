import { useEffect, useState } from "react";
import "../Home/home.css";
import "./schedule.css";

const IMAGE_BASE_URL = "http://localhost:5000/img";

const Schedule = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  const [scheduleTitle, setScheduleTitle] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [memo, setMemo] = useState("");

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/favorites", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("즐겨찾기 목록 조회 실패");
      }

      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error("즐겨찾기 목록 조회 실패:", error);
      setFavorites([]);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handlePlaceClick = async (placeId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/home/places/${placeId}`,
      );

      if (!response.ok) {
        throw new Error("장소 상세 조회 실패");
      }

      const data = await response.json();

      setSelectedImages(data.images);
      setIsModalOpen(true);
      setSelectedPlace(data.place);
    } catch (error) {
      console.error("장소 상세 조회 실패:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
    setSelectedImages([]);
  };

  const handleAddToSchedule = (place) => {
    const alreadyAdded = selectedPlaces.some((item) => item.id === place.id);

    if (alreadyAdded) {
      alert("이미 일정에 추가된 장소입니다.");
      return;
    }

    setSelectedPlaces((prev) => [
      ...prev,
      {
        ...place,
        visit_order: prev.length + 1,
      },
    ]);
  };

  const handleRemoveFromSchedule = (placeId) => {
    setSelectedPlaces((prev) =>
      prev
        .filter((place) => place.id !== placeId)
        .map((place, index) => ({
          ...place,
          visit_order: index + 1,
        })),
    );
  };

  const handleRemoveFavorite = async (placeId) => {
    const confirmed = window.confirm("즐겨찾기에서 삭제하시겠습니까?");

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/favorites/${placeId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("즐겨찾기 해제 실패");
      }

      setFavorites((prev) => prev.filter((place) => place.id !== placeId));

      setSelectedPlaces((prev) =>
        prev
          .filter((place) => place.id !== placeId)
          .map((place, index) => ({
            ...place,
            visit_order: index + 1,
          })),
      );
    } catch (error) {
      console.error("즐겨찾기 해제 실패:", error);
      alert("즐겨찾기 해제 중 문제가 발생했습니다.");
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleTitle.trim()) {
      alert("일정 제목을 입력해주세요.");
      return;
    }

    if (!visitDate) {
      alert("방문 날짜를 선택해주세요.");
      return;
    }

    if (!visitTime) {
      alert("여행 시작 시간을 선택해주세요.");
      return;
    }

    if (selectedPlaces.length === 0) {
      alert("일정에 추가할 장소를 선택해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          schedule_title: scheduleTitle,
          visit_date: visitDate,
          visit_time: visitTime,
          memo,
          places: selectedPlaces.map((place, index) => ({
            place_id: place.id,
            visit_order: index + 1,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("일정 저장 실패");
      }

      alert("일정이 저장되었습니다.");
      setSelectedPlaces([]);
      setScheduleTitle("");
      setVisitDate("");
      setVisitTime("");
      setMemo("");
    } catch (error) {
      console.error("일정 저장 실패:", error);
      alert("일정 저장 중 문제가 발생했습니다.");
    }
  };

  return (
    <section className="home-page">
      <div className="container home-container">
        <div className="home-hero">
          <div className="home-copy">
            <p className="home-eyebrow">SEOUL TRAVEL SCHEDULE</p>
            <h1>서울 여행 일정 만들기</h1>
            <p className="home-description">
              찜한 여행지로 나만의 여행 일정을 만들어보세요.
            </p>
          </div>
        </div>

        <div className="schedule-layout">
          <div className="schedule-main">
            <section className="results-section">
              <div className="results-header">
                <div>
                  <h2>즐겨찾기한 여행지</h2>
                  <p>관심 여행지를 일정에 추가할 수 있습니다.</p>
                </div>

                <span className="results-count">{favorites.length}건</span>
              </div>

              {favorites.length === 0 ? (
                <div className="results-empty">
                  <strong>즐겨찾기한 여행지가 없습니다.</strong>
                  <p>홈에서 마음에 드는 여행지를 하트로 저장해보세요.</p>
                </div>
              ) : (
                <div className="results-grid">
                  {favorites.map((place) => (
                    <article
                      key={place.id}
                      className="place-card"
                      onClick={() => handlePlaceClick(place.id)}
                    >
                      <div className="place-image-wrap">
                        <img
                          src={
                            place.main_image_url
                              ? `${IMAGE_BASE_URL}/${place.main_image_url}`
                              : "/images/default-place-image.png"
                          }
                          alt={place.name}
                          className="place-image"
                        />
                        <button
                          type="button"
                          className="favorite-button active"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRemoveFavorite(place.id);
                          }}
                        >
                          ♥
                        </button>
                      </div>

                      <div className="place-content">
                        <h3>{place.name}</h3>
                        <p className="place-address">
                          {place.road_address || place.address}
                        </p>
                        <p className="place-description">{place.description}</p>

                        <button
                          type="button"
                          className="add-schedule-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAddToSchedule(place);
                          }}
                        >
                          일정에 추가
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="schedule-panel">
            <div className="schedule-panel-header">
              <h2>나의 새 일정</h2>
              <p>선택한 여행지를 방문 순서대로 저장하세요.</p>
            </div>

            <div className="schedule-form">
              <label>
                일정 제목
                <input
                  type="text"
                  value={scheduleTitle}
                  onChange={(event) => setScheduleTitle(event.target.value)}
                  placeholder="예: 한강 산책 코스"
                />
              </label>

              <label>
                방문 날짜
                <input
                  type="date"
                  value={visitDate}
                  onChange={(event) => setVisitDate(event.target.value)}
                />
              </label>

              <label>
                시작 시간
                <input
                  type="time"
                  value={visitTime}
                  onChange={(event) => setVisitTime(event.target.value)}
                />
              </label>

              <label>
                메모
                <textarea
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  placeholder="예: 부모님과 함께 가는 일정"
                />
              </label>
            </div>

            {selectedPlaces.length === 0 ? (
              <div className="schedule-empty">아직 추가된 장소가 없습니다.</div>
            ) : (
              <ol className="schedule-list">
                {selectedPlaces.map((place, index) => (
                  <li key={place.id} className="schedule-item">
                    <div>
                      <strong>
                        {index + 1}. {place.name}
                      </strong>
                      <p>{place.road_address || place.address}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromSchedule(place.id)}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ol>
            )}

            <button
              type="button"
              className="schedule-save-button"
              onClick={handleSaveSchedule}
            >
              일정 저장하기
            </button>
          </section>
        </div>

        {isModalOpen && selectedPlace ? (
          <div className="place-modal-backdrop" onClick={handleCloseModal}>
            <div
              className="place-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="place-modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>

              <div className="place-modal-images">
                {selectedImages.length > 0 ? (
                  selectedImages.map((image) => (
                    <img
                      key={image.id}
                      src={`${IMAGE_BASE_URL}/${image.image_url}`}
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

                {selectedPlace.description ? (
                  <p className="place-modal-description">
                    {selectedPlace.description}
                  </p>
                ) : null}

                <dl className="place-detail-list">
                  <div>
                    <dt>주소</dt>
                    <dd>{selectedPlace.address || "-"}</dd>
                  </div>

                  <div>
                    <dt>신주소</dt>
                    <dd>{selectedPlace.road_address || "-"}</dd>
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

                  <div>
                    <dt>운영요일</dt>
                    <dd>{selectedPlace.operating_days || "-"}</dd>
                  </div>

                  <div>
                    <dt>휴무일</dt>
                    <dd>{selectedPlace.closed_days || "-"}</dd>
                  </div>

                  <div>
                    <dt>지하철</dt>
                    <dd>{selectedPlace.traffic_info_subway || "-"}</dd>
                  </div>

                  <div>
                    <dt>버스</dt>
                    <dd>{selectedPlace.traffic_info_bus || "-"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Schedule;
