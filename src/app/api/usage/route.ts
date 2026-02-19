import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const year = Number(searchParams.get("year")) || null;
  const month = Number(searchParams.get("month")) || null;

  const where: Record<string, unknown> = { userId };

  if (year && month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    where.usedAt = { gte: start, lt: end };
  }

  const [usages, total, amountAgg] = await Promise.all([
    prisma.cardUsage.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { usedAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.cardUsage.count({ where }),
    prisma.cardUsage.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  return NextResponse.json({
    usages,
    totalAmount: amountAgg._sum.amount ?? 0,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { usedAt, merchant, amount, purpose, memo, categoryId } = body;

    if (!usedAt || !purpose) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const usage = await prisma.cardUsage.create({
      data: {
        usedAt: new Date(usedAt),
        merchant: merchant || "",
        amount: amount ? Number(amount) : null,
        purpose,
        memo: memo || null,
        categoryId: categoryId || null,
        userId,
      },
    });

    return NextResponse.json(usage, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
