import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Search endpoint - Fetch service orders by search term
export async function GET(request: NextRequest) {
  try {
    // Extract search parameter from the URL
    const url = new URL(request.url);
    const search = url.searchParams.get("q");

    // Return empty array if no search term is provided
    if (!search || search.trim() === "") {
      return NextResponse.json([]);
    }

    // Create search query with proper Prisma types
    const whereClause: Prisma.ServiceOrderWhereInput = {
      OR: [
        { number: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          description: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
        {
          technicalNotes: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          client: {
            name: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
        },
      ],
    };

    // Fetch service orders with search
    const serviceOrders = await db.serviceOrder.findMany({
      where: whereClause,
      take: 10, // Limit to 10 results
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(serviceOrders);
  } catch (error) {
    console.error("Error searching service orders:", error);
    return NextResponse.json(
      { error: "Failed to search service orders" },
      { status: 500 }
    );
  }
}
