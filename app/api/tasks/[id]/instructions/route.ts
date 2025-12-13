import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Add an instruction to a task
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Verify ownership through task -> project
    const task = await prisma.projectTask.findFirst({
      where: {
        id: taskId,
        project: {
          creatorId: session.user.id,
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, body: instructionBody } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Instruction title is required" },
        { status: 400 }
      );
    }

    // Get the next position
    const lastInstruction = await prisma.taskInstruction.findFirst({
      where: { taskId },
      orderBy: { position: "desc" },
    });

    const position = (lastInstruction?.position ?? 0) + 1;

    // Create instruction with empty answer
    const newInstruction = await prisma.taskInstruction.create({
      data: {
        title,
        body: instructionBody || null,
        position,
        taskId,
        answers: {
          create: {
            htmlAnswer: null,
            cssAnswer: null,
            jsAnswer: null,
            pythonAnswer: null,
          },
        },
      },
      include: { answers: true },
    });

    return NextResponse.json(newInstruction, { status: 201 });
  } catch (error) {
    console.error("Error creating instruction:", error);
    return NextResponse.json(
      { error: "Failed to create instruction" },
      { status: 500 }
    );
  }
}
