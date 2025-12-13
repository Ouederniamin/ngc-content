import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single instruction with full hierarchy
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
      return NextResponse.json({ error: "Invalid instruction ID" }, { status: 400 });
    }

    const instruction = await prisma.lessonInstruction.findFirst({
      where: {
        id: instructionId,
        exercise: {
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
      },
      include: {
        answers: true,
        exercise: {
          select: {
            id: true,
            title: true,
            codeType: true,
            lesson: {
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
    console.error("Error fetching instruction:", error);
    return NextResponse.json(
      { error: "Failed to fetch instruction" },
      { status: 500 }
    );
  }
}

// PATCH - Update an instruction
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
      return NextResponse.json({ error: "Invalid instruction ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, body: bodyContent, position } = body;

    // Verify ownership
    const existingInstruction = await prisma.lessonInstruction.findFirst({
      where: {
        id: instructionId,
        exercise: {
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
      },
    });

    if (!existingInstruction) {
      return NextResponse.json(
        { error: "Instruction not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the instruction
    const updatedInstruction = await prisma.lessonInstruction.update({
      where: { id: instructionId },
      data: {
        ...(title !== undefined && { title }),
        ...(bodyContent !== undefined && { body: bodyContent }),
        ...(position !== undefined && { position }),
        updatedAt: new Date(),
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json(updatedInstruction);
  } catch (error) {
    console.error("Error updating instruction:", error);
    return NextResponse.json(
      { error: "Failed to update instruction" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an instruction
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
      return NextResponse.json({ error: "Invalid instruction ID" }, { status: 400 });
    }

    // Verify ownership and get exercise info for reordering
    const existingInstruction = await prisma.lessonInstruction.findFirst({
      where: {
        id: instructionId,
        exercise: {
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
      },
    });

    if (!existingInstruction) {
      return NextResponse.json(
        { error: "Instruction not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the instruction (cascade deletes answers)
    await prisma.lessonInstruction.delete({
      where: { id: instructionId },
    });

    // Reorder remaining instructions
    const remainingInstructions = await prisma.lessonInstruction.findMany({
      where: { exerciseId: existingInstruction.exerciseId },
      orderBy: { position: "asc" },
    });

    // Update positions
    for (let i = 0; i < remainingInstructions.length; i++) {
      await prisma.lessonInstruction.update({
        where: { id: remainingInstructions[i].id },
        data: { position: i + 1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting instruction:", error);
    return NextResponse.json(
      { error: "Failed to delete instruction" },
      { status: 500 }
    );
  }
}
