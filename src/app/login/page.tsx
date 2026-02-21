"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("remember_username");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("remember_username", username);
      localStorage.setItem("last_activity", new Date().toISOString());
      sessionStorage.removeItem("session_active");
    } else {
      localStorage.removeItem("remember_username");
      localStorage.removeItem("last_activity");
      sessionStorage.setItem("session_active", "true");
    }

    router.push("/");
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-8">로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-[#f87171] bg-[#f87171]/10 p-3 rounded-lg">{error}</p>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#e2e8f0] mb-1">
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors placeholder-[#64748b]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#e2e8f0] mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors placeholder-[#64748b]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#2a2d3a] bg-[#0f1117] accent-[#14b8a6] cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm text-[#e2e8f0] cursor-pointer">
              로그인 유지
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14b8a6] text-white py-2.5 rounded-lg hover:bg-[#0d9488] disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <p className="text-center text-sm text-[#64748b] mt-4">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-[#14b8a6] hover:text-[#2dd4bf] transition-colors">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
