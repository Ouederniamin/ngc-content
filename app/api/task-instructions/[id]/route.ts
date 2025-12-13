import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single task instruction with answers and full hierarchy
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
    const instructionId = parseInt(id);

    if (isNaN(instructionId)) {
      return NextResponse.json(
        { error: "Invalid instruction ID" },
        { status: 400 }
      );
    }

    const instruction = await prisma.taskInstruction.findFirst({
      where: {
        id: instructionId,
        task: {
          project: {
            creatorId: session.user.id,
          },
        },
      },
      include: {
        answers: true,
        task: {
          select: {
            id: true,
            title: true,
            codeType: true,
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
        },
      },
    });

    if (!instruction) {
      return NextResponse.json(
        { error: "Instruction not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(instruction);
  } catch (error) {
    console.error("Error fetching task instruction:", error);
    return NextResponse.json(
      { error: "Failed to fetch instruction" },
      { status: 500 }
    );
  }
}

// PATCH - Update a task instruction
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
    const instructionId = parseInt(id);

    if (isNaN(instructionId)) {
      return NextResponse.json(
        { error: "Invalid instruction ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, body: instructionBody, position } = body;

    // Verify ownership through task -> project
    const existingInstruction = await prisma.taskInstruction.findFirst({
      where: {
        id: instructionId,
        task: {
          project: {
            creatorId: session.user.id,
          },
        },
      },
    });

    if (!existingInstruction) {
      return NextResponse.json(
        { error: "Instruction not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the instruction
    const updatedInstruction = await prisma.taskInstruction.update({
      where: { id: instructionId },
      data: {
        ...(title !== undefined && { title }),
        ...(instructionBody !== undefined && { body: instructionBody }),
        ...(position !== undefined && { position }),
        updatedAt: new Date(),
      },
      include: { answers: true },
    });

    return NextResponse.json(updatedInstruction);
  } catch (error) {
    console.error("Error updating task instruction:", error);
    return NextResponse.json(
      { error: "Failed to update instruction" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a task instruction
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
    const instructionId = parseInt(id);

    if (isNaN(instructionId)) {
      return NextResponse.json(
        { error: "Invalid instruction ID" },
        { status: 400 }
      );
    }

    // Verify ownership through task -> project
    const existingInstruction = await prisma.taskInstruction.findFirst({
      where: {
        id: instructionId,
        task: {
          project: {
            creatorId: session.user.id,
          },
        },
      },
    });

    if (!existingInstruction) {
      return NextResponse.json(
        { error: "Instruction not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the instruction (cascade deletes answers)
    await prisma.taskInstruction.delete({
      where: { id: instructionId },
    });

    // Reorder remaining instructions
    await prisma.taskInstruction.updateMany({
      where: {
        taskId: existingInstruction.taskId,
        position: { gt: existingInstruction.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task instruction:", error);
    return NextResponse.json(
      { error: "Failed to delete instruction" },
      { status: 500 }
    );
  }
}
