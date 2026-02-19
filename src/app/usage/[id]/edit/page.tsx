"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import UsageForm from "@/components/UsageForm";

interface UsageData {
  id: string;
  usedAt: string;
  merchant: string;
  amount: number | null;
  purpose: string;
  memo: string | null;
  categoryId: string | null;
}

export default function EditUsagePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<UsageData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/usage/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("데이터를 불러올 수 없습니다.");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return <p className="text-[#f87171]">{error}</p>;
  }

  if (!data) {
    return <p className="text-[#64748b]">불러오는 중...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">사용내역 수정</h1>
      <UsageForm initialData={data} />
    </div>
  );
}
