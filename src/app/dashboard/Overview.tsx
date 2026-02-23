
import prisma from '@/lib/prisma';
import ViewSwitcher from './ViewSwitcher';

export const revalidate = 0; // Disable caching for this page

async function getManagerData() {
  const income = await prisma.income.aggregate({
    _sum: { amount: true },
  });

  const expenses = await prisma.expense.aggregate({
    _sum: { amount: true },
  });

  const expenseBreakdown = await prisma.expense.groupBy({
    by: ['category'],
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
  });

  const totalIncome = income._sum.amount?.toNumber() || 0;
  const totalExpenses = expenses._sum.amount?.toNumber() || 0;
  const profit = totalIncome - totalExpenses;

  const formattedBreakdown = expenseBreakdown.map(item => ({
    name: item.category,
    value: item._sum.amount?.toNumber() || 0,
  }));

  return { totalIncome, totalExpenses, profit, expenseBreakdown: formattedBreakdown };
}

async function getCleanerData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const checkOuts = await prisma.checkInRecord.findMany({
    where: {
      checkOutDate: {
        gte: today,
        lte: nextWeek,
      },
    },
    orderBy: {
      checkOutDate: 'asc',
    },
  });

  const laundry = await prisma.laundryRecord.findMany({
    where: {
      retrievalDate: null,
    },
    orderBy: {
      deliveryDate: 'asc',
    },
  });

  return { checkOuts, laundry };
}

async function getAvailableMonths() {
  const incomeMonths: { month: string }[] = await prisma.$queryRaw`
    SELECT DISTINCT TO_CHAR(date, 'YYYY-MM') as month FROM income_records ORDER BY month DESC
  `;

  const expenseMonths: { month: string }[] = await prisma.$queryRaw`
    SELECT DISTINCT TO_CHAR(date, 'YYYY-MM') as month FROM expense_records ORDER BY month DESC
  `;

  const allMonths = [...incomeMonths, ...expenseMonths].map(m => m.month);
  const uniqueMonths = [...new Set(allMonths)];
  uniqueMonths.sort().reverse(); // Sort descending

  return uniqueMonths;
}

export default async function Overview() {
  const managerData = await getManagerData();
  const cleanerData = await getCleanerData();
  const availableMonths = await getAvailableMonths();

  return <ViewSwitcher managerData={managerData} cleanerData={cleanerData} availableMonths={availableMonths} />;
}
