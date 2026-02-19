"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CardUsage {
  id: string;
  usedAt: string;
  merchant: string;
  amount: number | null;
  purpose: string;
  memo: string | null;
  category: { id: string; name: string } | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

function formatAmount(amount: number | null) {
  if (amount == null) return "-";
  return amount.toLocaleString("ko-KR") + "원";
}

const CATEGORY_COLORS = [
  "bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 text-[#2dd4bf]",
  "bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24]",
  "bg-[#818cf8]/10 border border-[#818cf8]/30 text-[#818cf8]",
  "bg-[#fb7185]/10 border border-[#fb7185]/30 text-[#fb7185]",
  "bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8]",
  "bg-[#34d399]/10 border border-[#34d399]/30 text-[#34d399]",
  "bg-[#fb923c]/10 border border-[#fb923c]/30 text-[#fb923c]",
];

// Generate month options from Feb 2026 to current month
function getMonthOptions() {
  const options: { year: number; month: number; label: string }[] = [];
  const now = new Date();
  const startYear = 2026;
  const startMonth = 2;

  let y = startYear;
  let m = startMonth;

  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1)) {
    options.push({
      year: y,
      month: m,
      label: `${y}년 ${m}월`,
    });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  return options;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usages, setUsages] = useState<CardUsage[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const monthOptions = getMonthOptions();

  // 등록 순서(인덱스)로 색상 배정 — 새 항목은 자동으로 다음 색상 사용
  const categoryColorMap = new Map(categories.map((cat, i) => [cat.id, i]));
  function getCategoryColor(id: string): string {
    const index = categoryColorMap.get(id) ?? 0;
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  }

  const fetchUsages = useCallback(
    async (p: number, year: number, month: number) => {
      setLoading(true);
      const res = await fetch(
        `/api/usage?page=${p}&year=${year}&month=${month}`
      );
      if (res.ok) {
        const data = await res.json();
        setUsages(data.usages);
        setPagination(data.pagination);
        setTotalAmount(data.totalAmount ?? 0);
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchUsages(page, selectedYear, selectedMonth);
    }
  }, [status, page, selectedYear, selectedMonth, router, fetchUsages]);

  function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [y, m] = e.target.value.split("-").map(Number);
    setSelectedYear(y);
    setSelectedMonth(m);
    setPage(1);
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/usage/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchUsages(page, selectedYear, selectedMonth);
    }
  }

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <p className="text-[#64748b]">불러오는 중...</p>;
  }

  if (!session) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-white">사용내역</h1>
        <div className="flex items-center gap-3">
          <select
            value={`${selectedYear}-${selectedMonth}`}
            onChange={handleMonthChange}
            className="bg-[#1a1d27] border border-[#2a2d3a] text-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#14b8a6] transition-colors"
          >
            {monthOptions.map((opt) => (
              <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                {opt.label}
              </option>
            ))}
          </select>
          <a
            href={`/api/usage/export?year=${selectedYear}&month=${selectedMonth}`}
            download
            className="border border-[#2a2d3a] text-[#14b8a6] px-4 py-2 rounded-lg hover:bg-[#14b8a6]/10 transition-colors text-sm whitespace-nowrap"
          >
            CSV
          </a>
          <Link
            href="/usage/new"
            className="bg-[#14b8a6] text-white px-4 py-2 rounded-lg hover:bg-[#0d9488] transition-colors text-sm whitespace-nowrap font-medium"
          >
            + 새 내역
          </Link>
        </div>
      </div>

      {usages.length === 0 ? (
        <div className="text-center py-20 text-[#64748b]">
          <p className="text-lg mb-2">
            {selectedYear}년 {selectedMonth}월 등록된 내역이 없습니다.
          </p>
          <p className="text-sm">위의 버튼을 눌러 새 내역을 등록해보세요.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full rounded-lg overflow-hidden">
              <thead className="bg-[#1a1d27] border-b border-[#2a2d3a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                    사용일자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                    적용항목
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                    용도
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                    사용처
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#64748b] uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {usages.map((usage) => (
                  <tr key={usage.id} className="bg-[#0f1117] hover:bg-[#1a1d27] border-b border-[#2a2d3a] transition-colors">
                    <td className="px-4 py-3 text-sm text-[#e2e8f0]">
                      {formatDate(usage.usedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {usage.category ? (
                        <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${getCategoryColor(usage.category.id)}`}>
                          {usage.category.name}
                        </span>
                      ) : (
                        <span className="text-[#64748b]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#e2e8f0]">
                      {usage.purpose}
                      {usage.memo && (
                        <span className="block text-xs text-[#64748b] mt-0.5">
                          {usage.memo}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-[#14b8a6]">
                      {formatAmount(usage.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">
                      {usage.merchant || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/usage/${usage.id}/edit`}
                        className="text-sm text-[#14b8a6] hover:text-[#2dd4bf] transition-colors mr-3"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(usage.id)}
                        className="text-sm text-[#f87171] hover:text-[#fca5a5] transition-colors"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-2">
            {usages.map((usage) => (
              <div
                key={usage.id}
                className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl px-4 py-3"
              >
                {/* Row 1: 용도/사유 (최대 2줄) */}
                <p className="text-sm font-medium text-[#e2e8f0] line-clamp-2 mb-1.5">
                  {usage.purpose}
                </p>
                {/* Row 2: 적용항목 + 금액 */}
                <div className="flex items-center justify-between mb-1.5">
                  {usage.category ? (
                    <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${getCategoryColor(usage.category.id)}`}>
                      {usage.category.name}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="font-bold text-[#14b8a6] text-sm">
                    {formatAmount(usage.amount)}
                  </span>
                </div>
                {/* Row 3: 날짜·사용처 + 수정/삭제 버튼 */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#64748b]">
                    {formatDate(usage.usedAt)}
                    {usage.merchant && ` · ${usage.merchant}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/usage/${usage.id}/edit`}
                      className="text-xs px-2.5 py-1 border border-[#14b8a6]/30 text-[#14b8a6] rounded hover:bg-[#14b8a6]/10 transition-colors"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(usage.id)}
                      className="text-xs px-2.5 py-1 border border-[#f87171]/30 text-[#f87171] rounded hover:bg-[#f87171]/10 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-[#2a2d3a] rounded text-sm text-[#e2e8f0] disabled:opacity-30 hover:bg-[#1a1d27] transition-colors"
              >
                이전
              </button>
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 border rounded text-sm transition-colors ${
                    p === page
                      ? "bg-[#14b8a6] text-white border-[#14b8a6]"
                      : "border-[#2a2d3a] text-[#e2e8f0] hover:bg-[#1a1d27]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="px-3 py-1 border border-[#2a2d3a] rounded text-sm text-[#e2e8f0] disabled:opacity-30 hover:bg-[#1a1d27] transition-colors"
              >
                다음
              </button>
            </div>
          )}

          {pagination && (
            <div className="flex items-center justify-between mt-3 px-1">
              <p className="text-xs text-[#64748b]">전체 {pagination.total}건</p>
              {totalAmount > 0 && (
                <p className="text-sm font-semibold text-[#14b8a6]">
                  합계: {totalAmount.toLocaleString("ko-KR")}원
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
