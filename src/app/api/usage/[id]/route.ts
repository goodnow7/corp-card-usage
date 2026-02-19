import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

async function getOwnUsage(id: string, userId: string) {
  const usage = await prisma.cardUsage.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
    },
  });
  if (!usage || usage.userId !== userId) return null;
  return usage;
}

export async function GET(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const usage = await getOwnUsage(id, userId);
  if (!usage) {
    return NextResponse.json(
      { error: "데이터를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json(usage);
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnUsage(id, userId);
  if (!existing) {
    return NextResponse.json(
      { error: "데이터를 찾을 수 없습니다." },
      { status: 404 }
    );
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

    const updated = await prisma.cardUsage.update({
      where: { id },
      data: {
        usedAt: new Date(usedAt),
        merchant: merchant || "",
        amount: amount ? Number(amount) : null,
        purpose,
        memo: memo || null,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnUsage(id, userId);
  if (!existing) {
    return NextResponse.json(
      { error: "데이터를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  await prisma.cardUsage.delete({ where: { id } });
  return NextResponse.json({ message: "삭제되었습니다." });
}
