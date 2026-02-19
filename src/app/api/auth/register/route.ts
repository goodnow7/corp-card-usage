import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = ["택시비", "접대비", "회식대", "회의음료"];

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "아이디는 3~20자로 입력해주세요." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    const hashed = await hash(password, 12);
    const user = await prisma.user.create({
      data: { username, password: hashed },
    });

    // Create default categories for the new user
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((name) => ({
        name,
        userId: user.id,
      })),
    });

    return NextResponse.json({ message: "회원가입이 완료되었습니다." });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
