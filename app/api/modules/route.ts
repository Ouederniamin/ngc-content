import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const modules = await prisma.module.findMany({
      where: {
        creatorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        unit: {
          select: {
            title: true,
            skillPath: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedModules = modules.map((m) => ({
      id: m.id,
      title: `${m.unit.skillPath.title} > ${m.unit.title} > ${m.title}`,
    }));

    return NextResponse.json(formattedModules);
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
