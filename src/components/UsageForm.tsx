"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface UsageFormProps {
  initialData?: {
    id: string;
    usedAt: string;
    merchant: string;
    amount: number | null;
    purpose: string;
    memo: string | null;
    categoryId: string | null;
  };
}

const CATEGORY_COLORS = [
  { base: "border-[#2dd4bf]/40 text-[#2dd4bf]", active: "bg-[#2dd4bf]/20 border-[#2dd4bf] text-[#2dd4bf]" },
  { base: "border-[#fbbf24]/40 text-[#fbbf24]", active: "bg-[#fbbf24]/20 border-[#fbbf24] text-[#fbbf24]" },
  { base: "border-[#818cf8]/40 text-[#818cf8]", active: "bg-[#818cf8]/20 border-[#818cf8] text-[#818cf8]" },
  { base: "border-[#fb7185]/40 text-[#fb7185]", active: "bg-[#fb7185]/20 border-[#fb7185] text-[#fb7185]" },
  { base: "border-[#38bdf8]/40 text-[#38bdf8]", active: "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]" },
  { base: "border-[#34d399]/40 text-[#34d399]", active: "bg-[#34d399]/20 border-[#34d399] text-[#34d399]" },
  { base: "border-[#fb923c]/40 text-[#fb923c]", active: "bg-[#fb923c]/20 border-[#fb923c] text-[#fb923c]" },
];

function getCategoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export default function UsageForm({ initialData }: UsageFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const dateRef = useRef<HTMLInputElement>(null);
  const purposeRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    usedAt: initialData?.usedAt
      ? new Date(initialData.usedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    merchant: initialData?.merchant ?? "",
    amount: initialData?.amount != null ? initialData.amount.toLocaleString("ko-KR") : "",
    purpose: initialData?.purpose ?? "",
    memo: initialData?.memo ?? "",
    categoryId: initialData?.categoryId ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  // 폼 진입 시 용도/사유 필드에 포커스 → lang="ko" 재적용으로 한글 자판 복원
  useEffect(() => {
    const timer = setTimeout(() => {
      purposeRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    dateRef.current?.blur();
    setForm((prev) => ({ ...prev, usedAt: value }));
  }

  function handleDateInput() {
    // iOS 휠 picker: input 이벤트가 날짜 변경마다 발생 → 400ms 후 blur로 즉시 닫기
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => {
      dateRef.current?.blur();
    }, 400);
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const formatted = raw ? Number(raw).toLocaleString("ko-KR") : "";
    setForm((prev) => ({ ...prev, amount: formatted }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.categoryId) {
      setError("적용항목을 선택해주세요.");
      return;
    }
    if (!form.purpose.trim()) {
      setError("용도/사유를 입력해주세요.");
      return;
    }

    setLoading(true);

    const url = isEdit ? `/api/usage/${initialData.id}` : "/api/usage";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usedAt: form.usedAt,
        merchant: form.merchant.trim(),
        amount: form.amount ? Number(form.amount.replace(/,/g, "")) : null,
        purpose: form.purpose,
        memo: form.memo,
        categoryId: form.categoryId || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "오류가 발생했습니다.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && (
        <p className="text-sm text-[#f87171] bg-[#f87171]/10 p-3 rounded-lg">{error}</p>
      )}
      <div>
        <label htmlFor="usedAt" className="block text-sm font-medium text-[#e2e8f0] mb-1">
          사용일자 <span className="text-[#f87171]">*</span>
        </label>
        <div className="relative">
          <input
            id="usedAt"
            name="usedAt"
            type="date"
            ref={dateRef}
            value={form.usedAt}
            onChange={handleDateChange}
            onInput={handleDateInput}
            required
            className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-[#14b8a6] transition-colors"
          />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const input = dateRef.current as HTMLInputElement & { showPicker?: () => void };
              if (input?.showPicker) {
                input.showPicker();
              } else {
                input?.focus();
                input?.click();
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
          적용항목 <span className="text-[#f87171]">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, i) => {
            const color = getCategoryColor(i);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, categoryId: cat.id }))
                }
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  form.categoryId === cat.id
                    ? color.active
                    : `bg-transparent ${color.base}`
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
        {categories.length === 0 && (
          <p className="text-xs text-[#64748b] mt-1">적용항목을 먼저 등록해주세요.</p>
        )}
      </div>
      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-[#e2e8f0] mb-1">
          용도/사유 <span className="text-[#f87171]">*</span>
        </label>
        <input
          ref={purposeRef}
          id="purpose"
          name="purpose"
          type="text"
          lang="ko"
          inputMode="text"
          value={form.purpose}
          onChange={handleChange}
          required
          className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors placeholder-[#64748b]"
          placeholder="예: 팀 회의 다과"
        />
      </div>
      <div>
        <label htmlFor="merchant" className="block text-sm font-medium text-[#e2e8f0] mb-1">
          사용처
        </label>
        <input
          id="merchant"
          name="merchant"
          type="text"
          lang="ko"
          inputMode="text"
          value={form.merchant}
          onChange={handleChange}
          className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors placeholder-[#64748b]"
          placeholder="예: 스타벅스 (선택)"
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-[#e2e8f0] mb-1">
          금액 (원)
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="numeric"
          value={form.amount}
          onChange={handleAmountChange}
          className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors placeholder-[#64748b]"
          placeholder="선택 입력"
        />
      </div>
      <div>
        <label htmlFor="memo" className="block text-sm font-medium text-[#e2e8f0] mb-1">
          메모
        </label>
        <textarea
          id="memo"
          name="memo"
          lang="ko"
          inputMode="text"
          value={form.memo}
          onChange={handleChange}
          rows={3}
          className="w-full bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors resize-none placeholder-[#64748b]"
          placeholder="추가 메모 (선택)"
        />
      </div>
      <div className="flex gap-3 justify-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#14b8a6] text-white px-6 py-2 rounded-lg hover:bg-[#0d9488] disabled:opacity-50 transition-colors font-medium"
        >
          {loading ? "저장 중..." : isEdit ? "수정" : "등록"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-[#2a2d3a] text-gray-400 px-6 py-2 rounded-lg hover:bg-[#1a1d27] transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
