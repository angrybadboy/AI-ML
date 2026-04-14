import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  if (!userId && !email) {
    return NextResponse.json({ hasAccess: false });
  }

  const payment = await prisma.payment.findFirst({
    where: {
      status: "succeeded",
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(email ? [{ customerEmail: email }] : []),
      ],
    },
  });

  return NextResponse.json({ hasAccess: !!payment });
}
