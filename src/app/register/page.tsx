"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-8">회원가입</h1>
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
              minLength={3}
              maxLength={20}
              className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors placeholder-[#64748b]"
              placeholder="3~20자"
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
              minLength={6}
              className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors placeholder-[#64748b]"
              placeholder="6자 이상"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#e2e8f0] mb-1">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors placeholder-[#64748b]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14b8a6] text-white py-2.5 rounded-lg hover:bg-[#0d9488] disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
        <p className="text-center text-sm text-[#64748b] mt-4">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[#14b8a6] hover:text-[#2dd4bf] transition-colors">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
