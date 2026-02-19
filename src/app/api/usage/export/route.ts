import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const year = Number(searchParams.get("year")) || null;
  const month = Number(searchParams.get("month")) || null;

  const where: Record<string, unknown> = { userId };

  if (year && month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    where.usedAt = { gte: start, lt: end };
  }

  const usages = await prisma.cardUsage.findMany({
    where,
    include: {
      category: { select: { name: true } },
    },
    orderBy: { usedAt: "asc" },
  });

  const header = ["사용일자", "적용항목", "용도/사유", "금액", "사용처", "메모"];

  const rows = usages.map((u) => [
    new Date(u.usedAt).toLocaleDateString("ko-KR"),
    u.category?.name ?? "",
    u.purpose,
    u.amount != null ? String(u.amount) : "",
    u.merchant,
    u.memo ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    )
    .join("\r\n");

  const filename =
    year && month
      ? `법인카드_${year}년${month}월.csv`
      : "법인카드_전체.csv";

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
