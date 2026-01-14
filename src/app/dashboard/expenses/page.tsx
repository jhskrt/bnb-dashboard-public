'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Expense } from '@prisma/client';
import ExpenseTrendChart from './ExpenseTrendChart';

const RECORDS_PER_PAGE = 30;

// Helper to get the current month in YYYY-MM format
const getCurrentYearMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-4 mt-6">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一頁
      </button>
      <span className="text-sm text-gray-700">第 {currentPage} / {totalPages} 頁</span>
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一頁
      </button>
    </div>
  );
};

const StatCard = ({ title, value, change, valueColor = 'text-gray-900 dark:text-white' }: { title: string, value: string, change?: string, valueColor?: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className={`mt-1 text-3xl font-semibold ${valueColor}`}>{value}</p>
        {change && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{change}</p>}
    </div>
);

export default function ExpensesPage() {
  const [records, setRecords] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState({ currentMonthTotal: 0, prevMonthTotal: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [monthOptions, setMonthOptions] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch summary data
  useEffect(() => {
    async function fetchSummary() {
      try {
        setSummaryLoading(true);
        const res = await fetch('/api/expenses/summary');
        if (!res.ok) {
          throw new Error('Failed to fetch summary');
        }
        const data = await res.json();
        setSummary(data);
      } catch (e) {
        console.error(e);
      } finally {
        setSummaryLoading(false);
      }
    }
    fetchSummary();
  }, []);

  // Fetch available months for the dropdown
  useEffect(() => {
    async function fetchMonths() {
        try {
            const res = await fetch('/api/expenses/first-record-date'); // Reuse existing API
            if (!res.ok) return;
            const data = await res.json();
            if (!data.firstDate) return;

            const options: string[] = [];
            const endDate = new Date();
            let currentDate = new Date(data.firstDate);

            while (currentDate <= endDate) {
                const year = currentDate.getFullYear();
                const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                options.unshift(`${year}-${month}`); // Add to the beginning to have newest first
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            setMonthOptions(options);
        } catch (e) {
            console.error("Failed to fetch month options", e);
        }
    }
    fetchMonths();
  }, []);

  // Fetch records when month or page changes
  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      setError(null);
      try {
        const [year, month] = selectedMonth.split('-');
        const res = await fetch(`/api/expenses?year=${year}&month=${month}&page=${currentPage}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data: { records: Expense[], totalCount: number } = await res.json();
        setRecords(data.records);
        setTotalPages(Math.ceil(data.totalCount / RECORDS_PER_PAGE));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [selectedMonth, currentPage]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
    setCurrentPage(1); // Reset to first page when month changes
  };

  const handleExport = () => {
    const [year, month] = selectedMonth.split('-');
    const exportUrl = `/api/expenses/export?year=${year}&month=${month}`;
    window.open(exportUrl, '_blank');
  };

  const difference = summary.currentMonthTotal - summary.prevMonthTotal;
  const percentageChange = summary.prevMonthTotal !== 0 
    ? (difference / summary.prevMonthTotal) * 100 
    : summary.currentMonthTotal > 0 ? 100 : 0;

  const formatCurrency = (amount: number) => `$${Math.round(amount).toLocaleString()}`;
  
  const formatDifference = (amount: number) => {
    const rounded = Math.round(amount);
    const sign = rounded > 0 ? '+' : '';
    return `${sign}${formatCurrency(rounded)}`;
  }

  let differenceColor = 'text-gray-900 dark:text-white';
  if (difference > 0) {
    differenceColor = 'text-red-500';
  } else if (difference < 0) {
    differenceColor = 'text-green-500';
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">支出總覽</h1>
      
      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="text-center p-10">載入摘要中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
                title="本月支出"
                value={formatCurrency(summary.currentMonthTotal)}
            />
            <StatCard 
                title="上個月支出"
                value={formatCurrency(summary.prevMonthTotal)}
            />
            <StatCard 
                title="與上月比較"
                value={formatDifference(difference)}
                change={`${percentageChange.toFixed(1)}%`}
                valueColor={differenceColor}
            />
        </div>
      )}

      <ExpenseTrendChart />

      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold">支出明細</h2>
        <div className="flex items-center space-x-4">
          <select onChange={handleMonthChange} value={selectedMonth} className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {monthOptions.map(month => (
                  <option key={month} value={month}>{month.replace('-', '年 ') + '月'}</option>
              ))}
          </select>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          >
            導出 CSV
          </button>
        </div>
      </div>

      <div className="responsive-table-container">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">日期</th>
              <th scope="col" className="px-6 py-3">類別</th>
              <th scope="col" className="px-6 py-3">備註</th>
              <th scope="col" className="px-6 py-3">額外備註</th>
              <th scope="col" className="px-6 py-3 text-right">金額</th>
              <th scope="col" className="px-6 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={6} className="text-center py-10">載入中...</td></tr>
            ) : error ? (
                <tr><td colSpan={6} className="text-center py-10 text-red-500">錯誤: {error}</td></tr>
            ) : records.length > 0 ? (
                records.map((record) => (
                  <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td data-label="日期" className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                    <td data-label="類別" className="px-6 py-4 min-w-24">{record.category}</td>
                    <td data-label="備註" className="px-6 py-4 min-w-32">{record.notes || '-'}</td>
                    <td data-label="額外備註" className="px-6 py-4 min-w-32">{record.extraNotes || '-'}</td>
                    <td data-label="金額" className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      $ {Math.round(Number(record.amount))}
                    </td>
                    <td data-label="操作" className="px-6 py-4 text-center">
                      <Link href={`/dashboard/expenses/edit/${record.id}`} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">
                        編輯
                      </Link>
                    </td>
                  </tr>
                ))
            ) : (
                <tr><td colSpan={6} className="text-center py-10">這個月份沒有支出紀錄。</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}