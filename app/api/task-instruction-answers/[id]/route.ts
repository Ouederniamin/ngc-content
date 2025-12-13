import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH - Update task instruction answer
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const answerId = parseInt(id);

    if (isNaN(answerId)) {
      return NextResponse.json({ error: "Invalid answer ID" }, { status: 400 });
    }

    const body = await request.json();
    const { htmlAnswer, cssAnswer, jsAnswer, pythonAnswer } = body;

    // Verify ownership through answer -> instruction -> task -> project
    const existingAnswer = await prisma.taskInstructionAnswer.findFirst({
      where: {
        id: answerId,
        instruction: {
          task: {
            project: {
              creatorId: session.user.id,
            },
          },
        },
      },
    });

    if (!existingAnswer) {
      return NextResponse.json(
        { error: "Answer not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the answer
    const updatedAnswer = await prisma.taskInstructionAnswer.update({
      where: { id: answerId },
      data: {
        ...(htmlAnswer !== undefined && { htmlAnswer }),
        ...(cssAnswer !== undefined && { cssAnswer }),
        ...(jsAnswer !== undefined && { jsAnswer }),
        ...(pythonAnswer !== undefined && { pythonAnswer }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedAnswer);
  } catch (error) {
    console.error("Error updating task instruction answer:", error);
    return NextResponse.json(
      { error: "Failed to update answer" },
      { status: 500 }
    );
  }
}
