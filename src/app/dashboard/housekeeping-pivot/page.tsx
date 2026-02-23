'use client';

import { useState, useEffect } from 'react';

interface PivotData {
  item: string | null;
  total: number;
}

// Helper to get the current month in YYYY-MM format
const getCurrentYearMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

const getMonthOptions = (firstDate: string | null) => {
  const options: { value: string; label: string }[] = [];
  const endDate = new Date();
  // Use the fetched first date, or default to 12 months ago if not available
  const startDate = firstDate ? new Date(firstDate) : new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);

  let currentDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (currentDate >= startDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const value = `${year}-${month.toString().padStart(2, '0')}`;
    const label = `${year}年 ${month}月`;
    options.push({ value, label });

    // Move to the previous month
    currentDate.setMonth(currentDate.getMonth() - 1);
  }
  return options;
};

export default function HousekeepingPivotPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [data, setData] = useState<PivotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstDate, setFirstDate] = useState<string | null>(null);
  const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([]);

  // Effect to fetch the very first expense date to build the dropdown
  useEffect(() => {
    const fetchFirstDate = async () => {
      try {
        const response = await fetch('/api/expenses/first-record-date');
        if (!response.ok) {
          throw new Error('Failed to fetch start date');
        }
        const data = await response.json();
        setFirstDate(data.firstDate);
      } catch (error) {
        console.error("Failed to fetch first expense date:", error);
        // On error, we can still proceed with default options
        setFirstDate(new Date().toISOString()); // Default to today
      }
    };
    fetchFirstDate();
  }, []);

  // Effect to update month options when the first date is fetched
  useEffect(() => {
    setMonthOptions(getMonthOptions(firstDate));
  }, [firstDate]);

  // Effect to fetch pivot data when the selected month changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedMonth) return;

      setIsLoading(true);
      setError(null);

      const [year, month] = selectedMonth.split('-');

      try {
        const response = await fetch(`/api/pivot/housekeeping?year=${year}&month=${month}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setData([]); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">房務人員支出樞紐分析</h1>
        <div>
          <label htmlFor="month-select" className="mr-2 text-sm font-medium text-gray-700">選擇月份:</label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            disabled={monthOptions.length === 0}
          >
            {monthOptions.length > 0 ? (
              monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            ) : (
              <option>讀取中...</option>
            )}
          </select>
        </div>
      </div>

      <div className="responsive-table-container bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支出項目 (備註)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  總金額
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-500">讀取中...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-red-500">{error}</td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td data-label="支出項目 (備註)" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.item || '未分類'}
                    </td>
                    <td data-label="總金額" className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                      {new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(row.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-500">該月份沒有房務人員支出紀錄。</td>
                </tr>
              )}
            </tbody>
             {data.length > 0 && (
                <tfoot>
                    <tr className="bg-gray-100 font-bold">
                        <td data-label="總計" className="px-6 py-3 text-left text-sm text-gray-800">總計</td>
                        <td data-label="總計金額" className="px-6 py-3 text-right text-sm text-gray-800">
                             {new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(
                                data.reduce((acc, row) => acc + row.total, 0)
                             )}
                        </td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
