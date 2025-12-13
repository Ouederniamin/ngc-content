import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH - Update an answer
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
      return NextResponse.json(
        { error: "Invalid answer ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { answer, isCorrect } = body;

    // Verify ownership through answer -> question -> quiz
    const existingAnswer = await prisma.quizAnswer.findFirst({
      where: {
        id: answerId,
        question: {
          quiz: {
            creatorId: session.user.id,
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
    const updatedAnswer = await prisma.quizAnswer.update({
      where: { id: answerId },
      data: {
        ...(answer !== undefined && { answer }),
        ...(isCorrect !== undefined && { isCorrect }),
      },
    });

    return NextResponse.json(updatedAnswer);
  } catch (error) {
    console.error("Error updating answer:", error);
    return NextResponse.json(
      { error: "Failed to update answer" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an answer
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
    const answerId = parseInt(id);

    if (isNaN(answerId)) {
      return NextResponse.json(
        { error: "Invalid answer ID" },
        { status: 400 }
      );
    }

    // Verify ownership through answer -> question -> quiz
    const existingAnswer = await prisma.quizAnswer.findFirst({
      where: {
        id: answerId,
        question: {
          quiz: {
            creatorId: session.user.id,
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

    // Delete the answer
    await prisma.quizAnswer.delete({
      where: { id: answerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting answer:", error);
    return NextResponse.json(
      { error: "Failed to delete answer" },
      { status: 500 }
    );
  }
}
