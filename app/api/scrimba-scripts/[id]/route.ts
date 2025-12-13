import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single scrimba script
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
    const scriptId = parseInt(id);

    if (isNaN(scriptId)) {
      return NextResponse.json({ error: "Invalid script ID" }, { status: 400 });
    }

    const script = await prisma.scrimbaScript.findFirst({
      where: {
        id: scriptId,
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

    if (!script) {
      return NextResponse.json(
        { error: "Script not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(script);
  } catch (error) {
    console.error("Error fetching scrimba script:", error);
    return NextResponse.json(
      { error: "Failed to fetch scrimba script" },
      { status: 500 }
    );
  }
}

// PATCH - Update a scrimba script
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
    const scriptId = parseInt(id);

    if (isNaN(scriptId)) {
      return NextResponse.json({ error: "Invalid script ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, isActive } = body;

    // Verify ownership
    const existingScript = await prisma.scrimbaScript.findFirst({
      where: {
        id: scriptId,
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
        lesson: true,
      },
    });

    if (!existingScript) {
      return NextResponse.json(
        { error: "Script not found or unauthorized" },
        { status: 404 }
      );
    }

    // If setting this script as active, deactivate others for the same lesson
    if (isActive === true) {
      await prisma.scrimbaScript.updateMany({
        where: {
          lessonId: existingScript.lessonId,
          id: { not: scriptId },
        },
        data: { isActive: false },
      });
    }

    // Update the script
    const updatedScript = await prisma.scrimbaScript.update({
      where: { id: scriptId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedScript);
  } catch (error) {
    console.error("Error updating scrimba script:", error);
    return NextResponse.json(
      { error: "Failed to update scrimba script" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a scrimba script
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
    const scriptId = parseInt(id);

    if (isNaN(scriptId)) {
      return NextResponse.json({ error: "Invalid script ID" }, { status: 400 });
    }

    // Verify ownership
    const existingScript = await prisma.scrimbaScript.findFirst({
      where: {
        id: scriptId,
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

    if (!existingScript) {
      return NextResponse.json(
        { error: "Script not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.scrimbaScript.delete({
      where: { id: scriptId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scrimba script:", error);
    return NextResponse.json(
      { error: "Failed to delete scrimba script" },
      { status: 500 }
    );
  }
}
