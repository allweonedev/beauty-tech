import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Handle bulk delete requests for clients
export async function POST(request: NextRequest) {
  try {
    // Parse request body to get array of client IDs
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No valid client IDs provided" },
        { status: 400 }
      );
    }

    // Delete related records first (to maintain referential integrity)
    // Delete client documents
    await db.clientDocument.deleteMany({
      where: {
        clientId: {
          in: ids,
        },
      },
    });

    // Delete client notes
    await db.clientNote.deleteMany({
      where: {
        clientId: {
          in: ids,
        },
      },
    });

    // Delete client interactions
    await db.clientInteraction.deleteMany({
      where: {
        clientId: {
          in: ids,
        },
      },
    });

    // Delete clients
    const deletedClients = await db.client.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      message: `${deletedClients.count} clients deleted successfully`,
      count: deletedClients.count,
    });
  } catch (error) {
    console.error("Error deleting clients:", error);
    return NextResponse.json(
      { error: "Failed to delete clients" },
      { status: 500 }
    );
  }
}
