import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Add an answer to a question
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
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Verify ownership through question -> quiz
    const question = await prisma.quizQuestion.findFirst({
      where: {
        id: questionId,
        quiz: {
          creatorId: session.user.id,
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { answer, isCorrect } = body;

    if (!answer) {
      return NextResponse.json(
        { error: "Answer text is required" },
        { status: 400 }
      );
    }

    // Create the answer
    const newAnswer = await prisma.quizAnswer.create({
      data: {
        answer,
        isCorrect: isCorrect || false,
        questionId,
      },
    });

    return NextResponse.json(newAnswer, { status: 201 });
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Failed to create answer" },
      { status: 500 }
    );
  }
}
