
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to get the correct Prisma model based on the 'model' parameter
function getPrismaModel(modelName: string): {
  findUnique: (args: { where: { id: string } }) => Promise<any | null>;
  update: (args: { where: { id: string }; data: any }) => Promise<any>;
} {
  switch (modelName) {
    case 'laundry':
      return prisma.laundryRecord;
    case 'income':
      return prisma.income;
    case 'expenses':
      return prisma.expense;
    case 'check-ins':
      return prisma.checkInRecord;
    // Add other models as needed
    default:      throw new Error(`Invalid model name: ${modelName}`);
  }
}

// GET /api/[model]/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ model: string; id: string }> }
) {
  try {
    const { model, id } = await context.params;
    const prismaModel = getPrismaModel(model);

    const record = await prismaModel.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error: any) {
    // Now, even if the promise rejects, we won't have a reference error.
    // We can add more specific error logging if needed.
    console.error(`Error fetching record:`, error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// PATCH /api/[model]/[id]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ model: string; id: string }> }
) {
  try {
    const { model, id } = await context.params;
    const prismaModel = getPrismaModel(model);
    const body = await req.json();

    let dataToUpdate: any = { ...body };

    // Special handling for date fields that might come as strings
    if (model === 'laundry' && dataToUpdate.retrievalDate !== undefined) {
      dataToUpdate.retrievalDate = dataToUpdate.retrievalDate ? new Date(dataToUpdate.retrievalDate) : null;
    }
    if (model === 'laundry' && dataToUpdate.deliveryDate !== undefined) {
      dataToUpdate.deliveryDate = dataToUpdate.deliveryDate ? new Date(dataToUpdate.deliveryDate) : null;
    }
    if (model === 'income' && dataToUpdate.date !== undefined) {
      dataToUpdate.date = dataToUpdate.date ? new Date(dataToUpdate.date) : null;
    }
    if (model === 'expenses' && dataToUpdate.date !== undefined) {
      dataToUpdate.date = dataToUpdate.date ? new Date(dataToUpdate.date) : null;
    }
    if (model === 'check-ins' && dataToUpdate.checkInDate !== undefined) {
      dataToUpdate.checkInDate = dataToUpdate.checkInDate ? new Date(dataToUpdate.checkInDate) : null;
    }
    if (model === 'check-ins' && dataToUpdate.checkOutDate !== undefined) {
      dataToUpdate.checkOutDate = dataToUpdate.checkOutDate ? new Date(dataToUpdate.checkOutDate) : null;
    }

    const updatedRecord = await prismaModel.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    console.error(`Error updating record:`, error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
