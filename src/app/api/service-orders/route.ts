import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Schema for validation
const serviceOrderSchema = z.object({
  number: z.string().min(1, "Order number is required"),
  clientId: z.string().min(1, "Client ID is required"),
  productId: z.string().optional().nullable(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .default("pending"),
  scheduledDate: z.string().optional().nullable(),
  completedDate: z.string().optional().nullable(),
  description: z.string().optional().default(""),
  technicalNotes: z.string().optional().default(""),
});

// GET - Fetch all service orders
export async function GET(request: NextRequest) {
  try {
    // Extract pagination parameters from the URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "0");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");

    // Calculate skip for pagination
    const skip = page * limit;

    // Fetch service orders from the database with pagination
    const serviceOrders = await db.serviceOrder.findMany({
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
    console.error("Error fetching service orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch service orders" },
      { status: 500 }
    );
  }
}

// POST - Create a new service order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = serviceOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Extract service order data
    const { scheduledDate, completedDate, ...rest } = validation.data;

    // Create service order in the database
    const newServiceOrder = await db.serviceOrder.create({
      data: {
        ...rest,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        completedDate: completedDate ? new Date(completedDate) : null,
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
        product: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(newServiceOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating service order:", error);
    return NextResponse.json(
      { error: "Failed to create service order" },
      { status: 500 }
    );
  }
}

// PUT - Update a service order by ID
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Service Order ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = serviceOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Extract service order data
    const { scheduledDate, completedDate, ...rest } = validation.data;

    // Check if service order exists
    const existingOrder = await db.serviceOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Service order not found" },
        { status: 404 }
      );
    }

    // Update service order in the database
    const updatedServiceOrder = await db.serviceOrder.update({
      where: { id },
      data: {
        ...rest,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        completedDate: completedDate ? new Date(completedDate) : null,
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
        product: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(updatedServiceOrder);
  } catch (error) {
    console.error("Error updating service order:", error);
    return NextResponse.json(
      { error: "Failed to update service order" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service order by ID
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Service Order ID is required" },
        { status: 400 }
      );
    }

    // Check if service order exists
    const existingOrder = await db.serviceOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Service order not found" },
        { status: 404 }
      );
    }

    // Delete service order from the database
    await db.serviceOrder.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service order deleted successfully" });
  } catch (error) {
    console.error("Error deleting service order:", error);
    return NextResponse.json(
      { error: "Failed to delete service order" },
      { status: 500 }
    );
  }
}
