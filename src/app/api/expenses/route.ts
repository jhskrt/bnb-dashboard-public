import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 30; // Records per page

  const whereClause: any = {};

  if (year && month) {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    if (!isNaN(yearNum) && !isNaN(monthNum)) {
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 1);
      whereClause.date = {
        gte: startDate,
        lt: endDate,
      };
    }
  }

  try {
    const [records, totalCount] = await prisma.$transaction([
      prisma.expense.findMany({
        where: whereClause,
        orderBy: {
          date: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({ records, totalCount });
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
