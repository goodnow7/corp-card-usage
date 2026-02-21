"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const INACTIVITY_DAYS = 7;
// 로그인/회원가입 페이지에서는 세션 가드를 실행하지 않음
const AUTH_PATHS = ["/login", "/register"];

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (AUTH_PATHS.includes(pathname)) return;

    const rememberUsername = localStorage.getItem("remember_username");

    if (rememberUsername) {
      // 로그인 유지 체크됨 — 7일 비활성 체크
      const lastActivity = localStorage.getItem("last_activity");
      if (lastActivity) {
        const daysSince =
          (Date.now() - new Date(lastActivity).getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysSince > INACTIVITY_DAYS) {
          localStorage.removeItem("last_activity");
          signOut({ callbackUrl: "/login" });
          return;
        }
      }
      localStorage.setItem("last_activity", new Date().toISOString());
    } else {
      // 로그인 유지 미체크 — 브라우저 세션 확인
      const sessionActive = sessionStorage.getItem("session_active");
      if (!sessionActive) {
        signOut({ callbackUrl: "/login" });
        return;
      }
    }
  }, [status, pathname]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
}
