'use server';

import prisma from '@/lib/prisma';

export async function getFilteredManagerData(yearMonth: string | 'all') {
  let whereClause = {};

  if (yearMonth !== 'all') {
    const [year, month] = yearMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    whereClause = {
      date: {
        gte: startDate,
        lt: endDate,
      },
    };
  }

  const income = await prisma.income.aggregate({
    _sum: { amount: true },
    where: whereClause,
  });

  const expenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: whereClause,
  });

  const expenseBreakdown = await prisma.expense.groupBy({
    by: ['category'],
    where: whereClause,
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

export async function createIncome(formData: FormData) {
    try {
        const data = {
            date: new Date(formData.get('date') as string),
            item: formData.get('item') as string,
            amount: parseFloat(formData.get('amount') as string),
            type: formData.get('type') as string,
            notes: formData.get('notes') as string || null,
        };

        if (!data.date || !data.item || isNaN(data.amount) || !data.type) {
            throw new Error('請填寫所有必填欄位');
        }

        await prisma.income.create({
            data: data,
        });

        return { success: true, message: '收入紀錄已成功新增' };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : '發生未知錯誤' };
    }
}

export async function createExpense(formData: FormData) {
    try {
        const data = {
            date: new Date(formData.get('date') as string),
            category: formData.get('category') as string,
            amount: parseFloat(formData.get('amount') as string),
            notes: formData.get('notes') as string || null,
            extraNotes: formData.get('extraNotes') as string || null,
        };

        if (!data.date || !data.category || isNaN(data.amount)) {
            throw new Error('請填寫所有必填欄位');
        }

        await prisma.expense.create({
            data: data,
        });

        return { success: true, message: '支出紀錄已成功新增' };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : '發生未知錯誤' };
    }
}

export async function createCheckIn(formData: FormData) {
    try {
        const data = {
            checkInDate: new Date(formData.get('checkInDate') as string),
            checkOutDate: new Date(formData.get('checkOutDate') as string),
            numberOfPeople: parseInt(formData.get('numberOfPeople') as string),
            numberOfRooms: parseInt(formData.get('numberOfRooms') as string),
            numberOfNights: parseInt(formData.get('numberOfNights') as string),
            numberOfHolidays: parseInt(formData.get('numberOfHolidays') as string),
            notes: formData.get('notes') as string || null,
        };

        if (!data.checkInDate || !data.checkOutDate || isNaN(data.numberOfPeople) || isNaN(data.numberOfRooms) || isNaN(data.numberOfNights) || isNaN(data.numberOfHolidays)) {
            throw new Error('請填寫所有必填欄位');
        }

        await prisma.checkInRecord.create({
            data: data,
        });

        return { success: true, message: '入住紀錄已成功新增' };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : '發生未知錯誤' };
    }
}

export async function createLaundry(formData: FormData) {
    try {
        const data = {
            deliveryDate: new Date(formData.get('deliveryDate') as string),
            retrievalDate: formData.get('retrievalDate') ? new Date(formData.get('retrievalDate') as string) : null,
            duvetCovers: parseInt(formData.get('duvetCovers') as string),
            bedSheets: parseInt(formData.get('bedSheets') as string),
            pillowcases: parseInt(formData.get('pillowcases') as string),
            largeTowels: parseInt(formData.get('largeTowels') as string),
            smallTowels: parseInt(formData.get('smallTowels') as string),
            notes: formData.get('notes') as string || null,
        };

        if (!data.deliveryDate || isNaN(data.duvetCovers) || isNaN(data.bedSheets) || isNaN(data.pillowcases) || isNaN(data.largeTowels) || isNaN(data.smallTowels)) {
            throw new Error('請填寫所有必填欄位');
        }

        await prisma.laundryRecord.create({
            data: data,
        });

        return { success: true, message: '送洗紀錄已成功新增' };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : '發生未知錯誤' };
    }
}