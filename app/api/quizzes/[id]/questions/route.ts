import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Add a new question to a quiz
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
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    // Verify quiz ownership
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        creatorId: session.user.id,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { question, explanation, answers } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Question text is required" },
        { status: 400 }
      );
    }

    // Get the next position
    const lastQuestion = await prisma.quizQuestion.findFirst({
      where: { quizId },
      orderBy: { position: "desc" },
    });

    const position = (lastQuestion?.position ?? 0) + 1;

    // Create question with answers
    const newQuestion = await prisma.quizQuestion.create({
      data: {
        question,
        explanation: explanation || null,
        position,
        quizId,
        answers: answers
          ? {
              create: answers.map(
                (a: { answer: string; isCorrect: boolean }) => ({
                  answer: a.answer,
                  isCorrect: a.isCorrect || false,
                })
              ),
            }
          : undefined,
      },
      include: { answers: true },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
