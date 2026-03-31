'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LaundryRecord } from '@prisma/client'; // Assuming LaundryRecord type is available from Prisma

export default function LaundryPage() {
  const [records, setRecords] = useState<LaundryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch('/api/laundry');
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data: LaundryRecord[] = await res.json();
        setRecords(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  if (loading) {
    return <div className="p-4">載入中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">錯誤: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">送洗紀錄</h1>
      <div className="responsive-table-container">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">送洗日期</th>
              <th scope="col" className="px-6 py-3">取回日期</th>
              <th scope="col" className="px-6 py-3 text-center">被套</th>
              <th scope="col" className="px-6 py-3 text-center">床單</th>
              <th scope="col" className="px-6 py-3 text-center">枕套</th>
              <th scope="col" className="px-6 py-3 text-center">大毛巾</th>
              <th scope="col" className="px-6 py-3 text-center">小毛巾</th>
              <th scope="col" className="px-6 py-3">備註</th>
              <th scope="col" className="px-6 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td data-label="送洗日期" className="px-6 py-4 whitespace-nowrap">{new Date(record.deliveryDate).toLocaleDateString()}</td>
                <td data-label="取回日期" className="px-6 py-4 whitespace-nowrap">
                  {record.retrievalDate ? new Date(record.retrievalDate).toLocaleDateString() : '未取回'}
                </td>
                <td data-label="被套" className="px-6 py-4 text-center">{record.duvetCovers}</td>
                <td data-label="床單" className="px-6 py-4 text-center">{record.bedSheets}</td>
                <td data-label="枕套" className="px-6 py-4 text-center">{record.pillowcases}</td>
                <td data-label="大毛巾" className="px-6 py-4 text-center">{record.largeTowels}</td>
                <td data-label="小毛巾" className="px-6 py-4 text-center">{record.smallTowels}</td>
                <td data-label="備註" className="px-6 py-4">{record.notes || '-'}</td>
                <td data-label="操作" className="px-6 py-4 text-center">
                  <Link href={`/dashboard/laundry/edit/${record.id}`} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">
                    編輯
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}