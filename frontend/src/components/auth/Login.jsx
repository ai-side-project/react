const Login = ({
  user,
  handleLogin,
  handleLogout,
  loading,
  email,
  password,
  setEmail,
  setPassword,
}) => {
  return user ? (
    <div className="user-info">
      <strong>{user.nickname}</strong>님 환영합니다!
      <button onClick={handleLogout} className="btn-logout">
        로그아웃
      </button>
    </div>
  ) : (
    <form onSubmit={handleLogin} className="auth-form">
      <input
        type="text"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "로그인 중..." : "LOGIN"}
      </button>
    </form>
  );
};

export default Login;
