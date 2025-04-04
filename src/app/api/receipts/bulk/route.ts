import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for bulk delete validation
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one receipt ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = bulkDeleteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { ids } = body;

    // First, delete all items of the receipts
    await db.receiptItem.deleteMany({
      where: {
        receiptId: {
          in: ids,
        },
      },
    });

    // Then delete the receipts themselves
    const result = await db.receipt.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error("Error deleting receipts:", error);
    return NextResponse.json(
      { error: "Failed to delete receipts" },
      { status: 500 }
    );
  }
}
