import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Use a raw SQL query to group expenses by day for the last 90 days.
    // This is more efficient than fetching all records and aggregating in JS.
    const trends: { day: Date, total: number }[] = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', date) AS day,
        SUM(amount)::float AS total
      FROM
        "expense_records"
      WHERE
        date >= NOW() - INTERVAL '12 months'
      GROUP BY
        day
      ORDER BY
        day ASC;
    `;

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Failed to fetch expense trends:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
