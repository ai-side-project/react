import { useEffect, useState } from "react";
import "../Home/home.css";
import "./dashboard.css";

const Dashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [openedGroupId, setOpenedGroupId] = useState(null);

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
    // fetchSchedules();
    setSchedules([
      {
        schedule_group_id: "test-schedule-1",
        schedule_title: "한강 산책 코스",
        visit_date: "2026-04-30",
        visit_time: "17:10",
        memo: "부모님과 함께 가는 일정",
        places: [
          {
            place_id: 1,
            visit_order: 1,
            name: "서울함 공원",
            address: "서울 마포구 망원동 205-5",
            road_address: "서울 마포구 마포나루길 407",
          },
          {
            place_id: 2,
            visit_order: 2,
            name: "석촌호수 야경",
            address: "서울 송파구 잠실동 47",
            road_address: "서울 송파구 삼학사로 136",
          },
        ],
      },
      {
        schedule_group_id: "test-schedule-2",
        schedule_title: "야경 여행 코스",
        visit_date: "2026-05-02",
        visit_time: "19:00",
        memo: "저녁 이후 산책 코스",
        places: [
          {
            place_id: 3,
            visit_order: 1,
            name: "청계천",
            address: "서울 종로구 무교로 37",
            road_address: "서울 종로구 무교로 37",
          },
          {
            place_id: 4,
            visit_order: 2,
            name: "반포 한강공원",
            address: "서울 서초구 반포동",
            road_address: "서울 서초구 신반포로11길 40",
          },
        ],
      },
    ]);
  }, []);

  const handleDeleteSchedule = async (groupId) => {
    const confirmed = window.confirm("이 일정을 삭제하시겠습니까?");

    if (!confirmed) return;

    setSchedules((prev) =>
      prev.filter((schedule) => schedule.schedule_group_id !== groupId),
    );
  };

  //   try {
  //     const response = await fetch(
  //       `http://localhost:5000/api/schedules/${groupId}`,
  //       {
  //         method: "DELETE",
  //         credentials: "include",
  //       },
  //     );

  //     if (!response.ok) {
  //       throw new Error("일정 삭제 실패");
  //     }

  //     alert("일정이 삭제되었습니다.");
  //     fetchSchedules();
  //   } catch (error) {
  //     console.error("일정 삭제 실패:", error);
  //     alert("일정 삭제 중 문제가 발생했습니다.");
  //   }
  // };

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

          {schedules.length === 0 ? (
            <div className="results-empty">
              <strong>저장한 일정이 없습니다.</strong>
              <p>일정 만들기 페이지에서 첫 일정을 저장해보세요.</p>
            </div>
          ) : (
            <div className="saved-schedule-list">
              {schedules.map((schedule) => (
                <article
                  key={schedule.schedule_group_id}
                  className="saved-schedule-card"
                >
                  <div className="saved-schedule-header">
                    <div>
                      <h3>{schedule.schedule_title}</h3>
                      <p>
                        {schedule.visit_date} · {schedule.visit_time} · 장소{" "}
                        {schedule.places?.length || 0}개
                      </p>

                      {schedule.memo ? (
                        <p className="saved-schedule-memo">
                          메모: {schedule.memo}
                        </p>
                      ) : null}
                    </div>

                    <div className="saved-schedule-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenedGroupId(
                            openedGroupId === schedule.schedule_group_id
                              ? null
                              : schedule.schedule_group_id,
                          )
                        }
                      >
                        상세보기
                      </button>

                      <button type="button">수정</button>

                      <button
                        type="button"
                        className="danger"
                        onClick={() =>
                          handleDeleteSchedule(schedule.schedule_group_id)
                        }
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {openedGroupId === schedule.schedule_group_id ? (
                    <ol className="saved-place-list">
                      {schedule.places.map((place) => (
                        <li key={place.place_id}>
                          <strong>
                            {place.visit_order}. {place.name}
                          </strong>
                          <span>{place.road_address || place.address}</span>
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
