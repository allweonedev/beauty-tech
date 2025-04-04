import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const receipts = await db.receipt.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
          { client: { name: { contains: query, mode: "insensitive" } } },
          { notes: { contains: query, mode: "insensitive" } },
          {
            items: {
              some: {
                description: { contains: query, mode: "insensitive" },
              },
            },
          },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      take: 20,
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Error searching receipts:", error);
    return NextResponse.json(
      { error: "Failed to search receipts" },
      { status: 500 }
    );
  }
}
