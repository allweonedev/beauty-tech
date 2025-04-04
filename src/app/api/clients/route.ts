import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Define interface types for client-related data structures
interface ClientData {
  name: string;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  address?: string | null;
  birthDate?: string | null;
  source?: "manual" | "smart-link";
}

interface DocumentData {
  id?: string;
  name: string;
  url: string;
  uploadedAt?: string | Date;
}

interface NoteData {
  id?: string;
  content: string;
  createdAt?: string | Date;
}

interface InteractionData {
  id?: string;
  type: string;
  description: string;
  date: string | Date;
  value?: number;
}

// Schema for validation
const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format").optional().nullable(),
  phone: z.string().min(1, "Phone is required").optional().nullable(),
  cpf: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  source: z.enum(["manual", "smart-link"]).default("manual"),
});

// GET - Fetch all clients
export async function GET(request: NextRequest) {
  try {
    // Extract pagination parameters from the URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "0");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");

    // Calculate skip for pagination
    const skip = page * limit;

    // Fetch clients with pagination
    const clients = await db.client.findMany({
      skip,
      take: limit,
      include: {
        documents: true,
        notes: true,
        interactions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = clientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Extract client data and related items
    const {
      documents = [],
      notes = [],
      interactions = [],
      ...clientData
    }: {
      documents?: DocumentData[];
      notes?: NoteData[];
      interactions?: InteractionData[];
    } & ClientData = body;

    // Convert birthDate string to Date object if it exists
    const birthDate = clientData.birthDate
      ? new Date(clientData.birthDate)
      : null;

    // Create a new client with validated data
    const newClient = await db.client.create({
      data: {
        ...clientData,
        birthDate,
        documents: {
          create: documents.map((doc: DocumentData) => ({
            name: doc.name,
            url: doc.url,
            uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
          })),
        },
        notes: {
          create: notes.map((note: NoteData) => ({
            content: note.content,
            createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
          })),
        },
        interactions: {
          create: interactions.map((interaction: InteractionData) => ({
            type: interaction.type,
            description: interaction.description,
            date: new Date(interaction.date),
            value: interaction.value,
          })),
        },
      },
      include: {
        documents: true,
        notes: true,
        interactions: true,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

// PUT - Update a client by ID
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = clientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Extract client data and related items
    const {
      documents,
      notes,
      interactions,
      ...clientData
    }: {
      documents?: DocumentData[];
      notes?: NoteData[];
      interactions?: InteractionData[];
    } & ClientData = body;

    // Convert birthDate string to Date object if it exists
    const birthDate = clientData.birthDate
      ? new Date(clientData.birthDate)
      : null;

    // Find the client to update
    const client = await db.client.findUnique({ where: { id } });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Update the client
    await db.client.update({
      where: { id },
      data: {
        ...clientData,
        birthDate,
      },
      include: {
        documents: true,
        notes: true,
        interactions: true,
      },
    });

    // If documents provided, handle them
    if (documents) {
      // Delete existing documents not in the new list
      await db.clientDocument.deleteMany({
        where: {
          clientId: id,
          id: {
            notIn: documents
              .filter((d: DocumentData) => d.id)
              .map((d: DocumentData) => d.id!),
          },
        },
      });

      // Update or create new documents
      for (const doc of documents) {
        if (doc.id) {
          await db.clientDocument.update({
            where: { id: doc.id },
            data: {
              name: doc.name,
              url: doc.url,
              uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : undefined,
            },
          });
        } else {
          await db.clientDocument.create({
            data: {
              clientId: id,
              name: doc.name,
              url: doc.url,
              uploadedAt: doc.uploadedAt
                ? new Date(doc.uploadedAt)
                : new Date(),
            },
          });
        }
      }
    }

    // If notes provided, handle them
    if (notes) {
      // Delete existing notes not in the new list
      await db.clientNote.deleteMany({
        where: {
          clientId: id,
          id: {
            notIn: notes
              .filter((n: NoteData) => n.id)
              .map((n: NoteData) => n.id!),
          },
        },
      });

      // Update or create new notes
      for (const note of notes) {
        if (note.id) {
          await db.clientNote.update({
            where: { id: note.id },
            data: {
              content: note.content,
              createdAt: note.createdAt ? new Date(note.createdAt) : undefined,
            },
          });
        } else {
          await db.clientNote.create({
            data: {
              clientId: id,
              content: note.content,
              createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
            },
          });
        }
      }
    }

    // If interactions provided, handle them
    if (interactions) {
      // Delete existing interactions not in the new list
      await db.clientInteraction.deleteMany({
        where: {
          clientId: id,
          id: {
            notIn: interactions
              .filter((i: InteractionData) => i.id)
              .map((i: InteractionData) => i.id!),
          },
        },
      });

      // Update or create new interactions
      for (const interaction of interactions) {
        if (interaction.id) {
          await db.clientInteraction.update({
            where: { id: interaction.id },
            data: {
              type: interaction.type,
              description: interaction.description,
              date: new Date(interaction.date),
              value: interaction.value,
            },
          });
        } else {
          await db.clientInteraction.create({
            data: {
              clientId: id,
              type: interaction.type,
              description: interaction.description,
              date: new Date(interaction.date),
              value: interaction.value,
            },
          });
        }
      }
    }

    // Fetch the updated client with all relations
    const refreshedClient = await db.client.findUnique({
      where: { id },
      include: {
        documents: true,
        notes: true,
        interactions: true,
      },
    });

    return NextResponse.json(refreshedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a client by ID
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Find the client to delete
    const client = await db.client.findUnique({ where: { id } });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Delete related records first
    await db.$transaction([
      db.clientDocument.deleteMany({ where: { clientId: id } }),
      db.clientNote.deleteMany({ where: { clientId: id } }),
      db.clientInteraction.deleteMany({ where: { clientId: id } }),
      db.client.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
