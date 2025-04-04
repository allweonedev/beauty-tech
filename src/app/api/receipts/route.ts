import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Define interface types for receipt-related data structures
interface ReceiptData {
  number?: string;
  clientId: string;
  date: string | Date;
  dueDate?: string | Date | null;
  paymentMethod: string;
  status?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  notes?: string | null;
}

interface ReceiptItemData {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  serviceDate?: string | Date | null;
  productId?: string | null;
}

// Schema for validation
const receiptSchema = z.object({
  number: z.string().optional(),
  clientId: z.string().min(1, "Client ID is required"),
  date: z.string().or(z.date()),
  dueDate: z.string().or(z.date()).optional().nullable(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  status: z.string().default("draft"),
  subtotal: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
  notes: z.string().optional().nullable(),
});

const receiptItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  amount: z.number().nonnegative(),
  serviceDate: z.string().or(z.date()).optional().nullable(),
  productId: z.string().optional().nullable(),
});

// GET - Fetch all receipts with pagination
export async function GET(request: NextRequest) {
  try {
    // Extract pagination parameters from the URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "0");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");
    const clientId = url.searchParams.get("clientId");

    // Calculate skip for pagination
    const skip = page * limit;

    // Prepare filter for optional clientId
    const filter: { clientId?: string } = {};
    if (clientId) {
      filter.clientId = clientId;
    }

    // Get total count based on filter
    const totalCount = await db.receipt.count({
      where: filter,
    });

    // Fetch receipts with pagination and filter
    const receipts = await db.receipt.findMany({
      where: filter,
      skip,
      take: limit,
      orderBy: {
        date: "desc",
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
    });

    return NextResponse.json({
      data: receipts,
      meta: {
        totalCount,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
      { status: 500 }
    );
  }
}

// POST - Create a new receipt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = receiptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Extract receipt data and items
    const {
      items = [],
      ...receiptData
    }: { items?: ReceiptItemData[] } & ReceiptData = body;

    // Validate each item
    for (const item of items) {
      const itemValidation = receiptItemSchema.safeParse(item);
      if (!itemValidation.success) {
        return NextResponse.json(
          {
            error: `Invalid item: ${JSON.stringify(itemValidation.error.errors)}`,
          },
          { status: 400 }
        );
      }
    }

    // Generate receipt number if not provided
    if (!receiptData.number) {
      const date = new Date();
      const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      const count = (await db.receipt.count()) + 1;
      receiptData.number = `REC-${yearMonth}-${count.toString().padStart(4, "0")}`;
    }

    // Convert date strings to Date objects
    const date = receiptData.date ? new Date(receiptData.date) : new Date();
    const dueDate = receiptData.dueDate ? new Date(receiptData.dueDate) : null;

    // Calculate totals if not provided
    const formattedItems = items.map((item) => ({
      ...item,
      serviceDate: item.serviceDate ? new Date(item.serviceDate) : null,
      amount: item.amount || item.quantity * item.unitPrice,
    }));

    const subtotal =
      receiptData.subtotal ??
      formattedItems.reduce((sum, item) => sum + item.amount, 0);

    const tax = receiptData.tax ?? 0;
    const discount = receiptData.discount ?? 0;
    const total = receiptData.total ?? subtotal + tax - discount;

    // Create a new receipt with validated data
    const newReceipt = await db.receipt.create({
      data: {
        number: receiptData.number,
        clientId: receiptData.clientId,
        date,
        dueDate,
        paymentMethod: receiptData.paymentMethod,
        status: receiptData.status ?? "draft",
        subtotal,
        tax,
        discount,
        total,
        notes: receiptData.notes ?? null,
        items: {
          create: formattedItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            serviceDate: item.serviceDate,
            productId: item.productId ?? null,
          })),
        },
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
    });

    return NextResponse.json(newReceipt, { status: 201 });
  } catch (error) {
    console.error("Error creating receipt:", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 }
    );
  }
}

// PUT - Update a receipt
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Receipt ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = receiptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Extract receipt data and items
    const {
      items = [],
      ...receiptData
    }: { items?: ReceiptItemData[] } & ReceiptData = body;

    // Validate each item
    for (const item of items) {
      const itemValidation = receiptItemSchema.safeParse(item);
      if (!itemValidation.success) {
        return NextResponse.json(
          {
            error: `Invalid item: ${JSON.stringify(itemValidation.error.errors)}`,
          },
          { status: 400 }
        );
      }
    }

    // Convert date strings to Date objects
    const date = receiptData.date ? new Date(receiptData.date) : undefined;
    const dueDate = receiptData.dueDate
      ? new Date(receiptData.dueDate)
      : undefined;

    // Handle items update - delete existing and create new
    // First, delete all existing items
    await db.receiptItem.deleteMany({
      where: { receiptId: id },
    });

    // Calculate totals if provided
    const formattedItems = items.map((item) => ({
      ...item,
      serviceDate: item.serviceDate ? new Date(item.serviceDate) : null,
      amount: item.amount || item.quantity * item.unitPrice,
    }));

    const subtotal =
      receiptData.subtotal ??
      formattedItems.reduce((sum, item) => sum + item.amount, 0);

    const tax = receiptData.tax ?? 0;
    const discount = receiptData.discount ?? 0;
    const total = receiptData.total ?? subtotal + tax - discount;

    // Update the receipt
    const updatedReceipt = await db.receipt.update({
      where: { id },
      data: {
        clientId: receiptData.clientId,
        date,
        dueDate,
        paymentMethod: receiptData.paymentMethod,
        status: receiptData.status ?? "draft",
        subtotal,
        tax,
        discount,
        total,
        notes: receiptData.notes ?? null,
        items: {
          create: formattedItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            serviceDate: item.serviceDate,
            productId: item.productId ?? null,
          })),
        },
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
    });

    return NextResponse.json(updatedReceipt);
  } catch (error) {
    console.error("Error updating receipt:", error);
    return NextResponse.json(
      { error: "Failed to update receipt" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a receipt by ID
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Receipt ID is required" },
        { status: 400 }
      );
    }

    // First delete all related items
    await db.receiptItem.deleteMany({
      where: { receiptId: id },
    });

    // Then delete the receipt
    await db.receipt.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return NextResponse.json(
      { error: "Failed to delete receipt" },
      { status: 500 }
    );
  }
}
