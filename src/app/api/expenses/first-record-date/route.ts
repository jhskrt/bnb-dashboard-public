import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const firstExpense = await prisma.expense.findFirst({
      orderBy: {
        date: 'asc',
      },
      select: {
        date: true,
      },
    });

    if (firstExpense) {
      return NextResponse.json({ firstDate: firstExpense.date });
    } else {
      return NextResponse.json({ firstDate: null });
    }
  } catch (error) {
    console.error('Failed to fetch first expense date:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
