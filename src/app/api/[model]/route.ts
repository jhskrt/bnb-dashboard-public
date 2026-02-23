import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to get the correct Prisma model based on the 'model' parameter
function getPrismaModel(modelName: string): {
  findMany: (args?: any) => Promise<any[]>;
  findUnique?: (args: { where: { id: string } }) => Promise<any | null>;
  create?: (args: { data: any }) => Promise<any>;
  update?: (args: { where: { id: string }; data: any }) => Promise<any>;
  delete?: (args: { where: { id: string } }) => Promise<any>;
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
    default:
      throw new Error(`Invalid model name: ${modelName}`);
  }
}

// GET /api/[model]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ model: string }> }
) {
  try {
    const { model } = await context.params;
    const prismaModel = getPrismaModel(model);

    const records = await prismaModel.findMany({
      orderBy:
        model === 'laundry'
          ? { deliveryDate: 'desc' }
          : model === 'expenses'
          ? { date: 'desc' }
          : { createdAt: 'desc' },
    });

    return NextResponse.json(records);
  } catch (error: any) {
    console.error(`Error fetching records:`, error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}