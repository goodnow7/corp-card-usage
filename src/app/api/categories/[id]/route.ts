import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.userId !== userId) {
    return NextResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "항목명을 입력해주세요." }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "이미 존재하는 항목명입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.userId !== userId) {
    return NextResponse.json(
      { error: "항목을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  // Unlink usages from this category before deleting
  await prisma.cardUsage.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ message: "삭제되었습니다." });
}
