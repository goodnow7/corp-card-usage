import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "항목명을 입력해주세요." },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), userId },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "이미 존재하는 항목입니다." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
