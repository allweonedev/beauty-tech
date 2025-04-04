import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Search endpoint - Fetch products by search term
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
    const whereClause: Prisma.ProductWhereInput = {
      OR: [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          description: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
        { category: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          application: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
      ],
    };

    // Fetch products with search
    const products = await db.product.findMany({
      where: whereClause,
      take: 10, // Limit to 10 results
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
