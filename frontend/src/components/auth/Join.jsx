const Join = ({
  handleJoin,
  nickname,
  setNickname,
  email,
  setEmail,
  password,
  setPassword,
  loading,
}) => {
  return (
    <form onSubmit={handleJoin} className="auth-form">
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
      <input
        className="nickInput"
        type="text"
        placeholder="닉네임"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        required
        disabled={loading}
      />
      <button disabled={loading} onClick={handleJoin}>
        {loading ? "회원 가입 중..." : "LOGUP"}
      </button>
    </form>
  );
};

export default Join;
