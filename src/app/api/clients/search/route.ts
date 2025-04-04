import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Search endpoint - Fetch clients by search term
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
    const whereClause: Prisma.ClientWhereInput = {
      OR: [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { phone: { contains: search } },
        { cpf: { contains: search } },
      ],
    };

    // Fetch clients with search
    const clients = await db.client.findMany({
      where: whereClause,
      take: 10, // Limit to 10 results
      include: {
        documents: true,
        notes: true,
        interactions: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error searching clients:", error);
    return NextResponse.json(
      { error: "Failed to search clients" },
      { status: 500 }
    );
  }
}
