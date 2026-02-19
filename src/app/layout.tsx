import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "법인카드 사용내역 관리",
  description: "법인카드 사용 내역을 기록하고 관리하는 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[#0f1117] text-[#e2e8f0] min-h-screen">
        <Providers>
          <Header />
          <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
