import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single task with instructions and full hierarchy
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const task = await prisma.projectTask.findFirst({
      where: {
        id: taskId,
        project: {
          creatorId: session.user.id,
        },
      },
      include: {
        instructions: {
          orderBy: { position: "asc" },
          include: { answers: true },
        },
        project: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
                unit: {
                  select: {
                    id: true,
                    title: true,
                    skillPath: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH - Update a task
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
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      description,
      notionContent,
      taskType,
      codeType,
      initialHTMLCode,
      initialCSSCode,
      initialJSCode,
      initialPythonCode,
      position,
      isPublished,
    } = body;

    // Verify ownership through project
    const existingTask = await prisma.projectTask.findFirst({
      where: {
        id: taskId,
        project: {
          creatorId: session.user.id,
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the task
    const updatedTask = await prisma.projectTask.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(notionContent !== undefined && { notionContent }),
        ...(taskType !== undefined && { taskType }),
        ...(codeType !== undefined && { codeType }),
        ...(initialHTMLCode !== undefined && { initialHTMLCode }),
        ...(initialCSSCode !== undefined && { initialCSSCode }),
        ...(initialJSCode !== undefined && { initialJSCode }),
        ...(initialPythonCode !== undefined && { initialPythonCode }),
        ...(position !== undefined && { position }),
        ...(isPublished !== undefined && { isPublished }),
        updatedAt: new Date(),
      },
      include: {
        instructions: {
          orderBy: { position: "asc" },
          include: { answers: true },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Verify ownership through project
    const existingTask = await prisma.projectTask.findFirst({
      where: {
        id: taskId,
        project: {
          creatorId: session.user.id,
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the task (cascade deletes instructions and answers)
    await prisma.projectTask.delete({
      where: { id: taskId },
    });

    // Reorder remaining tasks
    await prisma.projectTask.updateMany({
      where: {
        projectId: existingTask.projectId,
        position: { gt: existingTask.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
