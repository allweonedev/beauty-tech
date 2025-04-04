import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// DELETE - Bulk delete contracts
export async function DELETE(request: NextRequest) {
  try {
    // Extract IDs from the URL query parameter
    const url = new URL(request.url);
    const ids = url.searchParams.get("ids");

    if (!ids) {
      return NextResponse.json(
        { error: "Contract IDs are required" },
        { status: 400 }
      );
    }

    // Parse the comma-separated IDs
    const idArray = ids.split(",");

    if (idArray.length === 0) {
      return NextResponse.json(
        { error: "No valid Contract IDs provided" },
        { status: 400 }
      );
    }

    // Delete multiple contracts from the database
    const result = await db.contract.deleteMany({
      where: {
        id: {
          in: idArray,
        },
      },
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} contracts`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting contracts:", error);
    return NextResponse.json(
      { error: "Failed to bulk delete contracts" },
      { status: 500 }
    );
  }
}
