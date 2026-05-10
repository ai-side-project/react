import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Home/home.css";
import "./dashboard.css";

const Dashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [openedScheduleId, setOpenedScheduleId] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editPlaces, setEditPlaces] = useState([]);
  const [editMemo, setEditMemo] = useState("");
  const [placeSearchKeyword, setPlaceSearchKeyword] = useState("");
  const [placeSearchResults, setPlaceSearchResults] = useState([]);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  const navigate = useNavigate();

  const hasShownLoginAlert = useRef(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/schedules", {
        credentials: "include",
      });

      if (response.status === 401) {
        setIsUnauthorized(true);

        if (!hasShownLoginAlert.current) {
          hasShownLoginAlert.current = true;
          alert("로그인 후 이용할 수 있습니다.");
          navigate("/login");
        }

        return;
      }

      if (!response.ok) {
        throw new Error("일정 목록 조회 실패");
      }

      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error("일정 목록 조회 실패:", error);
      setSchedules([]);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDeleteSchedule = async (scheduleId) => {
    const confirmed = window.confirm("이 일정을 삭제하시겠습니까?");

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/schedules/${scheduleId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("일정 삭제 실패");
      }

      alert("일정이 삭제되었습니다.");
      fetchSchedules();
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      alert("일정 삭제 중 문제가 발생했습니다.");
    }
  };

  const handleStartEdit = (schedule) => {
    setEditingSchedule(schedule);

    setEditTitle(schedule.schedule_title || "");
    setEditStartDate(
      schedule.start_date ? schedule.start_date.slice(0, 10) : "",
    );
    setEditEndDate(schedule.end_date ? schedule.end_date.slice(0, 10) : "");
    setEditMemo(schedule.places?.[0]?.memo || "");

    setEditPlaces(
      (schedule.places || []).map((place, index) => ({
        ...place,
        visit_order: place.visit_order || index + 1,
      })),
    );
  };

  const handleRemoveEditPlace = (placeId) => {
    setEditPlaces((prev) =>
      prev
        .filter((place) => place.place_id !== placeId)
        .map((place, index) => ({
          ...place,
          visit_order: index + 1,
        })),
    );
  };

  const handleMoveEditPlaceUp = (index) => {
    if (index === 0) return;

    setEditPlaces((prev) => {
      const copied = [...prev];
      [copied[index - 1], copied[index]] = [copied[index], copied[index - 1]];

      return copied.map((place, placeIndex) => ({
        ...place,
        visit_order: placeIndex + 1,
      }));
    });
  };

  const handleMoveEditPlaceDown = (index) => {
    setEditPlaces((prev) => {
      if (index === prev.length - 1) return prev;

      const copied = [...prev];
      [copied[index], copied[index + 1]] = [copied[index + 1], copied[index]];

      return copied.map((place, placeIndex) => ({
        ...place,
        visit_order: placeIndex + 1,
      }));
    });
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setEditTitle("");
    setEditStartDate("");
    setEditEndDate("");
    setEditMemo("");
    setEditPlaces([]);
  };

  const handleSearchPlacesForEdit = async () => {
    if (!placeSearchKeyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/home/search?keyword=${encodeURIComponent(
          placeSearchKeyword,
        )}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("장소 검색 실패");
      }

      const data = await response.json();
      setPlaceSearchResults(data);
    } catch (error) {
      console.error("장소 검색 실패:", error);
      alert("장소 검색 중 문제가 발생했습니다.");
    }
  };

  const handleAddEditPlace = (place) => {
    const alreadyAdded = editPlaces.some(
      (editPlace) =>
        editPlace.place_id === place.id ||
        editPlace.place_id === place.place_id,
    );

    if (alreadyAdded) {
      alert("이미 일정에 추가된 장소입니다.");
      return;
    }

    setEditPlaces((prev) => [
      ...prev,
      {
        ...place,
        place_id: place.id || place.place_id,
        visit_order: prev.length + 1,
      },
    ]);
  };

  const handleCancelAddedPlace = (placeId) => {
    setEditPlaces((prev) =>
      prev
        .filter((place) => place.place_id !== placeId)
        .map((place, index) => ({
          ...place,
          visit_order: index + 1,
        })),
    );
  };

  const handleOpenPlaceDetail = async (placeId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/home/places/${placeId}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("장소 상세 조회 실패");
      }

      const data = await response.json();

      setSelectedPlaceDetail({
        ...data.place,
        images: data.images || [],
        main_image_url:
          data.images?.[0]?.url ||
          data.place?.main_image ||
          data.place?.main_image_url ||
          null,
      });

      setIsPlaceModalOpen(true);
    } catch (error) {
      console.error("장소 상세 조회 실패:", error);
      alert("장소 상세 정보를 불러오는 중 문제가 발생했습니다.");
    }
  };

  const handleClosePlaceModal = () => {
    setSelectedPlaceDetail(null);
    setIsPlaceModalOpen(false);
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    if (!editTitle.trim()) {
      alert("일정 제목을 입력해주세요.");
      return;
    }

    if (!editStartDate) {
      alert("여행 시작일을 선택해주세요.");
      return;
    }

    if (!editEndDate) {
      alert("여행 종료일을 선택해주세요.");
      return;
    }

    if (editEndDate < editStartDate) {
      alert("여행 종료일을 확인해 주세요.");
      return;
    }

    if (editPlaces.length === 0) {
      alert("일정에 최소 1개 이상의 장소가 필요합니다.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/schedules/${editingSchedule.schedule_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            schedule_title: editTitle,
            start_date: editStartDate,
            end_date: editEndDate,
            memo: editMemo,
            places: editPlaces.map((place, index) => ({
              place_id: place.place_id,
              visit_order: index + 1,
            })),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "일정 수정 실패");
      }

      alert("일정이 수정되었습니다.");
      handleCancelEdit();
      fetchSchedules();
    } catch (error) {
      console.error("일정 수정 실패:", error);
      alert("일정 수정 중 문제가 발생했습니다.");
    }
  };

  if (isCheckingAuth || isUnauthorized) {
    return null;
  }

  return (
    <section className="home-page dashboard-page">
      <div className="container home-container">
        <div className="home-hero">
          <div className="home-copy">
            <p className="home-eyebrow">MY TRAVEL SCHEDULE</p>
            <h1>내 여행 일정</h1>
            <p className="home-description">
              저장한 서울 여행 일정을 확인하고 관리할 수 있습니다.
            </p>
          </div>
        </div>

        <section className="results-section">
          <div className="results-header">
            <div>
              <h2>저장한 일정 목록</h2>
              <p>일정 상세를 확인하거나 삭제할 수 있습니다.</p>
            </div>

            <span className="results-count">{schedules.length}건</span>
          </div>

          {editingSchedule ? (
            <div className="edit-schedule-box">
              <h3>일정 수정</h3>

              <div className="edit-schedule-layout">
                <div className="edit-schedule-left">
                  <label>
                    일정 제목
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      placeholder="예: 한강 산책 코스"
                    />
                  </label>

                  <label>
                    여행 시작일
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(event) => setEditStartDate(event.target.value)}
                    />
                  </label>

                  <label>
                    여행 종료일
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(event) => setEditEndDate(event.target.value)}
                    />
                  </label>

                  <label>
                    메모
                    <textarea
                      value={editMemo}
                      onChange={(event) => setEditMemo(event.target.value)}
                      placeholder="메모를 입력하세요"
                      rows={6}
                    />
                  </label>
                </div>

                <div className="edit-schedule-right">
                  <div className="edit-schedule-places-box">
                    <h4>일정 장소</h4>
                    <div className="edit-add-place-box">
                      <h4>장소 추가</h4>
                      <p className="edit-add-place-desc">
                        전체 장소에서 검색해 일정에 추가할 수 있습니다.
                      </p>

                      <div className="edit-place-search">
                        <input
                          type="text"
                          value={placeSearchKeyword}
                          onChange={(event) =>
                            setPlaceSearchKeyword(event.target.value)
                          }
                          placeholder="예: 경복궁, 한강, 박물관"
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleSearchPlacesForEdit();
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={handleSearchPlacesForEdit}
                        >
                          검색
                        </button>
                      </div>

                      {placeSearchResults.length === 0 ? (
                        <p className="edit-place-empty">
                          검색 결과가 없습니다.
                        </p>
                      ) : (
                        <div className="edit-add-place-list">
                          {placeSearchResults.map((place) => {
                            const alreadyAdded = editPlaces.some(
                              (editPlace) => editPlace.place_id === place.id,
                            );

                            return (
                              <div
                                key={place.id}
                                className="edit-add-place-item"
                                onClick={() => handleOpenPlaceDetail(place.id)}
                              >
                                <div>
                                  <strong>{place.name}</strong>
                                  <p>
                                    {place.road_address ||
                                      place.new_address ||
                                      place.address}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  className={alreadyAdded ? "cancel" : ""}
                                  onClick={(event) => {
                                    event.stopPropagation();

                                    if (alreadyAdded) {
                                      handleCancelAddedPlace(place.id);
                                    } else {
                                      handleAddEditPlace(place);
                                    }
                                  }}
                                >
                                  {alreadyAdded ? "취소" : "추가"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {editPlaces.length === 0 ? (
                      <p className="edit-place-empty">
                        추가된 장소가 없습니다.
                      </p>
                    ) : (
                      <div className="edit-place-list">
                        {editPlaces.map((place, index) => (
                          <div
                            key={place.schedule_item_id || place.place_id}
                            className="edit-place-item"
                            onClick={() =>
                              handleOpenPlaceDetail(place.place_id)
                            }
                          >
                            <div className="edit-place-info">
                              <strong>
                                {index + 1}. {place.name}
                              </strong>
                              <p>{place.road_address || place.address}</p>
                            </div>

                            <div className="edit-place-actions">
                              <button
                                type="button"
                                aria-label="위로 이동"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleMoveEditPlaceUp(index);
                                }}
                                disabled={index === 0}
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                aria-label="아래로 이동"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleMoveEditPlaceDown(index);
                                }}
                                disabled={index === editPlaces.length - 1}
                              >
                                ↓
                              </button>

                              <button
                                type="button"
                                className="danger"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRemoveEditPlace(place.place_id);
                                }}
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="edit-schedule-actions">
                <button type="button" onClick={handleUpdateSchedule}>
                  수정 완료
                </button>
                <button type="button" onClick={handleCancelEdit}>
                  취소
                </button>
              </div>
            </div>
          ) : null}

          {schedules.length === 0 ? (
            <div className="results-empty">
              <strong>저장한 일정이 없습니다.</strong>
              <p>일정 만들기 페이지에서 첫 일정을 저장해보세요.</p>
            </div>
          ) : (
            <div className="saved-schedule-list">
              {schedules.map((schedule) => (
                <article
                  key={schedule.schedule_id}
                  className="saved-schedule-card"
                >
                  <div className="saved-schedule-header">
                    <div>
                      <h3>{schedule.schedule_title}</h3>
                      <p>
                        {schedule.start_date?.slice(0, 10)} ~{" "}
                        {schedule.end_date?.slice(0, 10)} · 장소{" "}
                        {schedule.places?.length || 0}개
                      </p>

                      {schedule.places?.[0]?.memo ? (
                        <p className="saved-schedule-memo">
                          메모: {schedule.places[0].memo}
                        </p>
                      ) : null}
                    </div>

                    <div className="saved-schedule-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenedScheduleId(
                            openedScheduleId === schedule.schedule_id
                              ? null
                              : schedule.schedule_id,
                          )
                        }
                      >
                        상세보기
                      </button>

                      <button
                        type="button"
                        className="ai-analysis-button"
                        onClick={() =>
                          navigate(
                            `/dashboard/schedules/${schedule.schedule_id}/analysis`,
                          )
                        }
                      >
                        AI 분석
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(schedule)}
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        className="danger"
                        onClick={() =>
                          handleDeleteSchedule(schedule.schedule_id)
                        }
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {openedScheduleId === schedule.schedule_id ? (
                    <ol className="saved-place-list">
                      {schedule.places.map((place) => (
                        <li
                          key={place.schedule_item_id || place.place_id}
                          className="saved-place-item"
                          onClick={() => handleOpenPlaceDetail(place.place_id)}
                        >
                          <strong>
                            {place.visit_order}. {place.name}
                          </strong>
                          <span>
                            {place.new_address ||
                              place.road_address ||
                              place.address}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      {isPlaceModalOpen && selectedPlaceDetail ? (
        <div
          className="place-detail-modal-overlay"
          onClick={handleClosePlaceModal}
        >
          <div
            className="place-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="place-detail-close"
              onClick={handleClosePlaceModal}
            >
              ×
            </button>

            <div className="place-detail-image-gallery">
              {selectedPlaceDetail.images?.length > 0 ? (
                selectedPlaceDetail.images
                  .slice(0, 4)
                  .map((image) => (
                    <img
                      key={image.id || image.url}
                      src={image.url}
                      alt={selectedPlaceDetail.name}
                    />
                  ))
              ) : selectedPlaceDetail.main_image_url ? (
                <img
                  src={selectedPlaceDetail.main_image_url}
                  alt={selectedPlaceDetail.name}
                />
              ) : (
                <div className="place-detail-no-image">이미지 준비중</div>
              )}
            </div>

            <div className="place-detail-content">
              <h3>{selectedPlaceDetail.name}</h3>

              <p className="place-detail-address">
                {selectedPlaceDetail.new_address ||
                  selectedPlaceDetail.road_address ||
                  selectedPlaceDetail.address}
              </p>

              {selectedPlaceDetail.description ? (
                <p className="place-detail-description">
                  {selectedPlaceDetail.description}
                </p>
              ) : null}

              <dl className="place-detail-info">
                {selectedPlaceDetail.telephone ? (
                  <>
                    <dt>전화번호</dt>
                    <dd>{selectedPlaceDetail.telephone}</dd>
                  </>
                ) : null}

                {selectedPlaceDetail.opening_hours ? (
                  <>
                    <dt>운영시간</dt>
                    <dd>{selectedPlaceDetail.opening_hours}</dd>
                  </>
                ) : null}

                {selectedPlaceDetail.closed_days ? (
                  <>
                    <dt>휴무일</dt>
                    <dd>{selectedPlaceDetail.closed_days}</dd>
                  </>
                ) : null}

                {selectedPlaceDetail.usage_fee ? (
                  <>
                    <dt>이용요금</dt>
                    <dd>{selectedPlaceDetail.usage_fee}</dd>
                  </>
                ) : null}
              </dl>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Dashboard;
