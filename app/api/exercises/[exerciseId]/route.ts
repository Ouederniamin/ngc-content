import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ exerciseId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseId } = await context.params;
    const id = parseInt(exerciseId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 });
    }

    const exercise = await prisma.lessonExercise.findFirst({
      where: {
        id,
        lesson: {
          module: {
            unit: {
              skillPath: {
                creatorId: session.user.id,
              },
            },
          },
        },
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                unit: {
                  include: {
                    skillPath: true,
                  },
                },
              },
            },
          },
        },
        instructions: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercise" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseId } = await context.params;
    const id = parseInt(exerciseId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 });
    }

    // Verify ownership
    const exercise = await prisma.lessonExercise.findFirst({
      where: {
        id,
        lesson: {
          module: {
            unit: {
              skillPath: {
                creatorId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const body = await request.json();
    const { content, codeType, description, title } = body;

    const updatedExercise = await prisma.lessonExercise.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(codeType !== undefined && { codeType }),
        ...(description !== undefined && { description }),
        ...(title !== undefined && { title }),
      },
    });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 }
    );
  }
}
