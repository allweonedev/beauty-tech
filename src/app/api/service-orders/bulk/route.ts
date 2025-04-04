import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// DELETE - Bulk delete service orders
export async function DELETE(request: NextRequest) {
  try {
    // Extract IDs from the URL query parameter
    const url = new URL(request.url);
    const ids = url.searchParams.get("ids");

    if (!ids) {
      return NextResponse.json(
        { error: "Service Order IDs are required" },
        { status: 400 }
      );
    }

    // Parse the comma-separated IDs
    const idArray = ids.split(",");

    if (idArray.length === 0) {
      return NextResponse.json(
        { error: "No valid Service Order IDs provided" },
        { status: 400 }
      );
    }

    // Delete multiple service orders from the database
    const result = await db.serviceOrder.deleteMany({
      where: {
        id: {
          in: idArray,
        },
      },
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} service orders`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting service orders:", error);
    return NextResponse.json(
      { error: "Failed to bulk delete service orders" },
      { status: 500 }
    );
  }
}
