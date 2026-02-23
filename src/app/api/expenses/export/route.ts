
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unparse } from 'papaparse';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return new NextResponse('Year and month parameters are required', { status: 400 });
    }

    const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
    const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1));
    endDate.setUTCDate(endDate.getUTCDate() - 1);

    const records = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (records.length === 0) {
        return new NextResponse('No data for selected month', { status: 404 });
    }

    const formattedData = records.map(r => ({
      '日期': r.date.toISOString().split('T')[0],
      '類別': r.category,
      '金額': r.amount,
      '備註': r.notes,
      '額外備註': r.extraNotes,
    }));

    const csv = unparse(formattedData);

    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="expenses-${year}-${month}.csv"`);

    return new NextResponse('\uFEFF' + csv, { headers }); // Add BOM for Excel compatibility

  } catch (error) {
    console.error('Failed to export expenses:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
