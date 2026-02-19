"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-[#1a1d27] border-b border-[#2a2d3a]">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-white p-0.5 flex items-center justify-center shrink-0"
            style={{ mixBlendMode: "normal" }}>
            <Image
              src="/etribe_logo.png"
              alt="etribe"
              width={30}
              height={30}
              className="object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
          <span className="text-lg font-bold text-white">Corp Card Usage</span>
        </Link>
        {session?.user ? (
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/categories"
              className="text-sm text-gray-400 hover:text-[#14b8a6] transition-colors whitespace-nowrap"
            >
              적용항목
            </Link>
            <span className="hidden sm:inline text-sm text-[#64748b] truncate max-w-[100px]">
              {session.user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-400 hover:text-[#14b8a6] transition-colors whitespace-nowrap"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-[#14b8a6] hover:text-[#2dd4bf] transition-colors whitespace-nowrap"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
