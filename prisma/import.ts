
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

// Function to parse date strings like "2025-08" and "08-16" into a Date object
function parseDate(yearMonth: string, day: string): Date | null {
  if (!yearMonth || !day) {
    return null;
  }
  const [year] = yearMonth.split('-');
  const [month, date] = day.split('-').map(Number);
  if (!year || !month || !date) {
    return null;
  }
  // Note: The month in JavaScript's Date is 0-indexed (0-11)
  return new Date(parseInt(year, 10), month - 1, date);
}

async function main() {
  console.log('Starting CSV import...');

  // 1. Import Check-in Records
  await processCheckInRecords();

  // 2. Import Income Records
  await processIncomeRecords();

  // 3. Import Expense Records
  await processExpenseRecords();

  // 4. Import Laundry Records
  await processLaundryRecords();

  console.log('CSV import finished.');
}

async function processCheckInRecords() {
  const filePath = path.join(process.cwd(), '日出山丘 2025 - 入住紀錄.csv');
  if (!fs.existsSync(filePath)) {
    console.log('Check-in records CSV not found. Skipping.');
    return;
  }
  const file = fs.readFileSync(filePath, 'utf8');
  const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });

  const records = data.map((row: any) => {
    const checkInDate = parseDate(row['月份'], row['Check-in date']);
    const checkOutDate = parseDate(row['月份'], row['Check-out date']);

    if (!checkInDate || !checkOutDate) {
        console.warn('Skipping check-in record due to invalid date:', row);
        return null;
    }

    return {
      checkInDate,
      checkOutDate,
      numberOfPeople: parseInt(row['Number of people'], 10) || 0,
      numberOfRooms: parseInt(row['Number of rooms'], 10) || 0,
      numberOfNights: parseInt(row['入住晚數'], 10) || 0,
      numberOfHolidays: parseInt(row['幾天假日'], 10) || 0,
      notes: row['note'] || null,
    };
  }).filter(Boolean); // Filter out null records

  if (records.length > 0) {
    console.log(`Importing ${records.length} check-in records...`);
    await prisma.checkInRecord.createMany({
      data: records as any,
      skipDuplicates: true,
    });
  }
}

async function processIncomeRecords() {
    const filePath = path.join(process.cwd(), '日出山丘 2025 - 收入表.csv');
    if (!fs.existsSync(filePath)) {
        console.log('Income records CSV not found. Skipping.');
        return;
    }
    const file = fs.readFileSync(filePath, 'utf8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });

    const records = data.map((row: any) => {
        const date = parseDate(row['月份'], row['日期']);
        if (!date) {
            console.warn('Skipping income record due to invalid date:', row);
            return null;
        }
        return {
            date,
            item: row['項目'] || 'N/A',
            amount: parseFloat(row['金額']) || 0,
            type: row['類型'] || 'N/A',
            notes: row['備註'] || null,
        };
    }).filter(Boolean);

    if (records.length > 0) {
        console.log(`Importing ${records.length} income records...`);
        await prisma.income.createMany({
            data: records as any,
            skipDuplicates: true,
        });
    }
}

async function processExpenseRecords() {
    const filePath = path.join(process.cwd(), '日出山丘 2025 - 支出表.csv');
    if (!fs.existsSync(filePath)) {
        console.log('Expense records CSV not found. Skipping.');
        return;
    }
    const file = fs.readFileSync(filePath, 'utf8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });

    const records = data.map((row: any) => {
        const date = parseDate(row['月份'], row['date']);
        if (!date) {
            console.warn('Skipping expense record due to invalid date:', row);
            return null;
        }
        return {
            date,
            category: row['category'] || 'N/A',
            amount: parseFloat(row['amount']) || 0,
            notes: row['note'] || null,
            extraNotes: row['note2'] || null,
        };
    }).filter(Boolean);

    if (records.length > 0) {
        console.log(`Importing ${records.length} expense records...`);
        await prisma.expense.createMany({
            data: records as any,
            skipDuplicates: true,
        });
    }
}


async function processLaundryRecords() {
    const filePath = path.join(process.cwd(), '日出山丘 2025 - 送洗紀錄.csv');
    if (!fs.existsSync(filePath)) {
        console.log('Laundry records CSV not found. Skipping.');
        return;
    }
    const file = fs.readFileSync(filePath, 'utf8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });

    const records = data.map((row: any) => {
        const deliveryDate = parseDate(row['月份'], row['Delivery date']);
        const retrievalDate = parseDate(row['月份'], row['Retrieval date']); // Can be null

        if (!deliveryDate) {
            console.warn('Skipping laundry record due to invalid delivery date:', row);
            return null;
        }

        return {
            deliveryDate,
            retrievalDate,
            duvetCovers: parseInt(row['被套'], 10) || 0,
            bedSheets: parseInt(row['床包'], 10) || 0,
            pillowcases: parseInt(row['枕頭套'], 10) || 0,
            largeTowels: parseInt(row['大毛巾'], 10) || 0,
            smallTowels: parseInt(row['小毛巾'], 10) || 0,
            notes: row['note'] || null,
        };
    }).filter(Boolean);

    if (records.length > 0) {
        console.log(`Importing ${records.length} laundry records...`);
        await prisma.laundryRecord.createMany({
            data: records as any,
            skipDuplicates: true,
        });
    }
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
