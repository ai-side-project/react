import { useEffect, useState } from "react";
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

  const fetchSchedules = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/schedules", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("일정 목록 조회 실패");
      }

      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error("일정 목록 조회 실패:", error);
      setSchedules([]);
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
                                onClick={() => handleMoveEditPlaceUp(index)}
                                disabled={index === 0}
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                aria-label="아래로 이동"
                                onClick={() => handleMoveEditPlaceDown(index)}
                                disabled={index === editPlaces.length - 1}
                              >
                                ↓
                              </button>

                              <button
                                type="button"
                                className="danger"
                                onClick={() =>
                                  handleRemoveEditPlace(place.place_id)
                                }
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
                        <li key={place.schedule_item_id || place.place_id}>
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
    </section>
  );
};

export default Dashboard;
