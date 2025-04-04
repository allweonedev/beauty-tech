import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Schema for validation
const contractSchema = z.object({
  number: z.string().min(1, "Contract number is required"),
  clientId: z.string().min(1, "Client ID is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  value: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nonnegative("Value must be a positive number")
  ),
  status: z
    .enum(["active", "expired", "terminated", "pending"])
    .default("active"),
  description: z.string().optional(),
  paymentTerms: z.string().optional(),
  renewalTerms: z.string().optional(),
});

// GET - Fetch all contracts
export async function GET(request: NextRequest) {
  try {
    // Extract pagination parameters from the URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "0");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");

    // Calculate skip for pagination
    const skip = page * limit;

    // Get total count
    const totalCount = await db.contract.count();

    // Fetch contracts from the database with pagination
    const contracts = await db.contract.findMany({
      skip,
      take: limit,
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

    return NextResponse.json({
      data: contracts,
      meta: {
        totalCount,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

// POST - Create a new contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = contractSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Extract contract data
    const { startDate, endDate, ...rest } = validation.data;

    // Create contract in the database
    const newContract = await db.contract.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
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
      },
    });

    return NextResponse.json(newContract, { status: 201 });
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}

// PUT - Update a contract by ID
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Contract ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = contractSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Extract contract data
    const { startDate, endDate, ...rest } = validation.data;

    // Check if contract exists
    const existingContract = await db.contract.findUnique({
      where: { id },
    });

    if (!existingContract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Update contract in the database
    const updatedContract = await db.contract.update({
      where: { id },
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
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
      },
    });

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error("Error updating contract:", error);
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a contract by ID
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Contract ID is required" },
        { status: 400 }
      );
    }

    // Check if contract exists
    const existingContract = await db.contract.findUnique({
      where: { id },
    });

    if (!existingContract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Delete contract from the database
    await db.contract.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Contract deleted successfully" });
  } catch (error) {
    console.error("Error deleting contract:", error);
    return NextResponse.json(
      { error: "Failed to delete contract" },
      { status: 500 }
    );
  }
}
