import { useEffect, useState } from "react"
import axios from "axios"
// import Loading from "./Loading";
import { useAuthStore } from "../store/authStore"
/**
 * API 기본 경로
 * - 개발(로컬): vite proxy를 통해 /api -> http://localhost:5000
 * - 배포: 같은 도메인에서 서비스하면 기본값(/api)로 동작
 * - 별도 도메인/포트로 백엔드 운영 시: .env에 VITE_API_URL=http://<host>:5000/api 지정
 */
const API_URL = import.meta.env.VITE_API_URL || "/api"
//★ instance 객체를 사용해서 에러를 하나로 모아서 alert창으로 획일적으로 보여준다
const instance = axios.create({
  //baseURL: API_URL, // 이렇게 하면 아래에서 ${API_URL}을 매번 안 써도 됩니다.
  withCredentials: true, // (수정됨) width -> with 로 변경 필수!
})

export let fetchPosts = null
export let logoutList = null
function Board({ title = "자유 게시판" }) {
  const [posts, setPosts] = useState([])
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  logoutList = () => {
    setPosts([])
  }
  fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await instance.get(`${API_URL}/posts`)
      console.log(res.data)
      setPosts(res.data)
    } catch (e) {
      // alert("게시글을 불러오지 못했습니다.");
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPost = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return alert("제목을 입력하세요.")

    try {
      const res = await instance.post(`${API_URL}/posts`, {
        title: newTitle.trim(),
        content: newContent.trim(),
      })
      setPosts([res.data, ...posts])
      setNewTitle("")
      setNewContent("")
    } catch (e) {
      console.error(e)
      // alert("글 작성에 실패했습니다.");
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      await instance.delete(`${API_URL}/posts/${id}`)
      setPosts(posts.filter((p) => p.id !== id))
    } catch (e) {
      console.error(e)
      // alert("삭제 실패");
    }
  }

  return (
    <div className="board container">
      <h2>{title}</h2>

      <form onSubmit={handleAddPost} className="write-form">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <textarea
          placeholder="내용 (선택사항)"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows="4"
        />
        <button type="submit">글쓰기</button>
      </form>

      {/* {<p className="loadingCircle"></p>} */}

      <ul className="post-list">
        {posts.length === 0 && !loading && (
          <li className="empty">
            아직 게시글이 없습니다. 첫 글을 작성해보세요!
          </li>
        )}
        {posts.map((post) => (
          <li key={post.id} className="post-item">
            <div className="post-content">
              <strong>{post.title}</strong>
              {post.content && <p>{post.content}</p>}
              <small>{new Date(post.createdAt).toLocaleString("ko-KR")}</small>
            </div>
            <button
              onClick={() => handleDelete(post.id)}
              className="btn-delete"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Board
