
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function GET() {
  try {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const prevMonthDate = subMonths(now, 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);

    const currentMonthExpenses = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    });

    const prevMonthExpenses = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
    });

    const summary = {
      currentMonthTotal: currentMonthExpenses._sum.amount || 0,
      prevMonthTotal: prevMonthExpenses._sum.amount || 0,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Failed to get expense summary:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
