import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single question with answers and full hierarchy
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
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    const question = await prisma.quizQuestion.findFirst({
      where: {
        id: questionId,
        quiz: {
          creatorId: session.user.id,
        },
      },
      include: {
        answers: true,
        quiz: {
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

    if (!question) {
      return NextResponse.json(
        { error: "Question not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

// PATCH - Update a question
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
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { question, explanation, position } = body;

    // Verify ownership through quiz
    const existingQuestion = await prisma.quizQuestion.findFirst({
      where: {
        id: questionId,
        quiz: {
          creatorId: session.user.id,
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the question
    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        ...(question !== undefined && { question }),
        ...(explanation !== undefined && { explanation }),
        ...(position !== undefined && { position }),
      },
      include: { answers: true },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a question
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
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Verify ownership through quiz
    const existingQuestion = await prisma.quizQuestion.findFirst({
      where: {
        id: questionId,
        quiz: {
          creatorId: session.user.id,
        },
      },
      include: { quiz: true },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the question (cascade deletes answers)
    await prisma.quizQuestion.delete({
      where: { id: questionId },
    });

    // Reorder remaining questions
    await prisma.quizQuestion.updateMany({
      where: {
        quizId: existingQuestion.quizId,
        position: { gt: existingQuestion.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
