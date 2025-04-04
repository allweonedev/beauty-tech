import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Search endpoint - Fetch contracts by search term
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
    const whereClause: Prisma.ContractWhereInput = {
      OR: [
        { number: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          description: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
        {
          client: {
            name: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
        },
      ],
    };

    // Fetch contracts with search
    const contracts = await db.contract.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error("Error searching contracts:", error);
    return NextResponse.json(
      { error: "Failed to search contracts" },
      { status: 500 }
    );
  }
}
