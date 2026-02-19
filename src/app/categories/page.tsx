"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchCategories();
    }
  }, [status, router]);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/categories");
    if (res.ok) {
      setCategories(await res.json());
    }
    setLoading(false);
  }

  async function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!newName.trim()) return;

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }

    setNewName("");
    fetchCategories();
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setEditError("");
  }

  async function handleRename(id: string) {
    setEditError("");
    if (!editingName.trim()) return;

    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setEditError(data.error);
      return;
    }

    setEditingId(null);
    fetchCategories();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 항목을 삭제하시겠습니까?\n해당 항목이 사용된 내역에서는 항목이 해제됩니다.`)) return;

    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchCategories();
    }
  }

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <p className="text-[#64748b]">불러오는 중...</p>;
  }

  if (!session) return null;

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">적용항목 관리</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="새 항목명 입력"
          className="flex-1 bg-[#0f1117] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#14b8a6] transition-colors placeholder-[#64748b]"
        />
        <button
          type="submit"
          className="bg-[#14b8a6] text-white px-4 py-2 rounded-lg hover:bg-[#0d9488] transition-colors text-sm whitespace-nowrap font-medium"
        >
          추가
        </button>
      </form>

      {error && (
        <p className="text-sm text-[#f87171] bg-[#f87171]/10 p-3 rounded-lg mb-4">
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="text-[#64748b] text-center py-10">
          등록된 적용항목이 없습니다.
        </p>
      ) : (
        <ul className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl divide-y divide-[#2a2d3a]">
          {categories.map((cat) => (
            <li key={cat.id} className="px-4 py-3">
              {editingId === cat.id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(cat.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                      className="flex-1 bg-[#0f1117] border border-[#14b8a6] text-white rounded px-2 py-1 text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleRename(cat.id)}
                      className="text-sm text-white bg-[#14b8a6] hover:bg-[#0d9488] px-3 py-1 rounded transition-colors"
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-[#2a2d3a] transition-colors"
                    >
                      취소
                    </button>
                  </div>
                  {editError && (
                    <p className="text-xs text-[#f87171]">{editError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e2e8f0]">{cat.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-xs px-2.5 py-1 border border-[#14b8a6]/30 text-[#14b8a6] rounded hover:bg-[#14b8a6]/10 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="text-xs px-2.5 py-1 border border-[#f87171]/30 text-[#f87171] rounded hover:bg-[#f87171]/10 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
