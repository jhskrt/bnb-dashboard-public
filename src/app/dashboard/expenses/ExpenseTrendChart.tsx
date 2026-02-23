'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  day: string;
  total: number;
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-300 rounded-md shadow-lg">
        <p className="label font-semibold">{`${new Date(label).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}`}</p>
        <p className="intro text-indigo-600">{`總支出: ${new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/expenses/trends');
        if (!response.ok) {
          throw new Error('無法獲取趨勢資料');
        }
        const result = await response.json();
        // Format date for the chart
        const formattedData = result.map((item: any) => ({
          ...item,
          day: new Date(item.day).toISOString().split('T')[0],
        }));
        setData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="h-80 w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">讀取圖表資料中...</div>;
  }

  if (error) {
    return <div className="h-80 w-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">過去 12 個月支出趨勢</h2>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                        dataKey="day" 
                        tickFormatter={(tick) => new Date(tick).toLocaleDateString('zh-TW', { month: 'short' })}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={5}
                    />
                    <YAxis 
                        tickFormatter={(tick) => `${tick / 1000}k`}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dx={-5}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 8 }} name="每月總支出" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}
