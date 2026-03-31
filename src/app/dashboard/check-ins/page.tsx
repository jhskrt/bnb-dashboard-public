import prisma from '@/lib/prisma';
import CheckInCalendar from './CheckInCalendar';

export const dynamic = 'force-dynamic';


async function getCheckInRecords() {
  const records = await prisma.checkInRecord.findMany({
    orderBy: {
      checkInDate: 'desc',
    },
  });
  return records;
}

export default async function CheckInsPage() {
  const records = await getCheckInRecords();

  const formattedEvents = records.map(record => ({
    title: `${record.numberOfRooms}房 / ${record.numberOfPeople}人`,
    start: record.checkInDate,
    end: record.checkOutDate,
    id: record.id,
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">入住紀錄日曆</h1>
      <CheckInCalendar events={formattedEvents} />
    </div>
  );
}