import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Schema for validation
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["equipment", "service"]),
  description: z.string(),
  price: z.number().min(0, "Price must be positive"),
  imageUrl: z.string().optional().nullable(),
  category: z.string(),
  application: z.string(),
});

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    // Extract pagination parameters from the URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "0");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");

    // Calculate skip for pagination
    const skip = page * limit;

    // Get total count
    const totalCount = await db.product.count();

    // Fetch products with pagination
    const products = await db.product.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: products,
      meta: {
        totalCount,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    console.log("Creating product");
    const body = await request.json();

    // Validate request body
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Create a new product with validated data
    const newProduct = await db.product.create({
      data: {
        ...body,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT - Update a product by ID
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Find the product to update
    const product = await db.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update the product
    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        ...body,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product by ID
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find the product to delete
    const product = await db.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete the product
    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
