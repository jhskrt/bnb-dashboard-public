
'use client';

import { useState, useTransition } from 'react';
import { getFilteredManagerData } from './actions';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ===== TYPES =====
interface ExpenseBreakdownItem {
    name: string;
    value: number;
    [key: string]: any;
}

interface ManagerData {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  expenseBreakdown: ExpenseBreakdownItem[];
}

interface CleanerData {
  checkOuts: { id: string; numberOfRooms: number; checkOutDate: Date }[];
  laundry: { id: string; deliveryDate: Date; duvetCovers: number; bedSheets: number; pillowcases: number; largeTowels: number; smallTowels: number; }[];
}

interface ViewSwitcherProps {
  managerData: ManagerData;
  cleanerData: CleanerData;
  availableMonths: string[];
}

// ===== VIEW COMPONENTS =====

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ExpensePieChart = ({ data }: { data: ExpenseBreakdownItem[] }) => (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-700 mb-4">支出分類</h3>
        <ResponsiveContainer width="100%" height={500}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="70%" // Slightly reduce radius to give more space
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(props) => {
                        const { name, percent, cx, cy, midAngle, outerRadius, innerRadius } = props as unknown as {
                            name: string;
                            percent: number;
                            cx: number;
                            cy: number;
                            midAngle: number;
                            outerRadius: number;
                            innerRadius: number;
                        };
                        if (percent < 0.05) { // Don't render label for small slices
                            return null;
                        }
                        const RADIAN = Math.PI / 180;
                        // A bit further out for clarity
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                            <text
                                x={x}
                                y={y}
                                fill="#374151" // gray-700
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                className="text-xs md:text-sm"
                            >
                                {`${name} (${(percent * 100).toFixed(0)}%)`}
                            </text>
                        );
                    }}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" />
            </PieChart>
        </ResponsiveContainer>
    </div>
);

const ManagerView = ({ data, availableMonths, onFilterChange, isPending }: {
    data: ManagerData;
    availableMonths: string[];
    onFilterChange: (filter: string) => void;
    isPending: boolean;
}) => (
  <div>
    <div className="flex justify-end mb-4">
        <select 
            onChange={(e) => onFilterChange(e.target.value)}
            className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
            <option value="all">全部</option>
            {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
            ))}
        </select>
    </div>
    <div className={`transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-500">總收入</h3>
                <p className="text-3xl font-bold">${data.totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-500">總支出</h3>
                <p className="text-3xl font-bold">${data.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-500">淨利潤</h3>
                <p className="text-3xl font-bold">${data.profit.toLocaleString()}</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-1">
                 <ExpensePieChart data={data.expenseBreakdown} />
            </div>
        </div>
    </div>
  </div>
);

const CleanerView = ({ data }: { data: CleanerData }) => {
    const isUrgent = (date: Date | string) => {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        return checkDate.getTime() === today.getTime() || checkDate.getTime() === tomorrow.getTime();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">今日任務</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-2">未來一周的退房情況</h3>
                    <ul className="space-y-2">
                        {data.checkOuts.map(co => (
                            <li 
                                key={co.id} 
                                className={`p-2 rounded-md ${isUrgent(co.checkOutDate) ? 'bg-yellow-200' : 'bg-gray-50'}`}
                            >
                                {co.numberOfRooms} 間房 - {new Date(co.checkOutDate).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-2">送洗紀錄</h3>
                    <ul className="space-y-2">
                        {data.laundry.map(l => (
                            <li key={l.id} className="p-2 bg-gray-50 rounded-md">
                                {new Date(l.deliveryDate).toLocaleDateString()}: 被套: {l.duvetCovers}, 床包: {l.bedSheets}, 枕頭套: {l.pillowcases}, 大毛巾: {l.largeTowels}, 小毛巾: {l.smallTowels}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
type View = 'manager' | 'cleaner';

export default function ViewSwitcher({ managerData: initialManagerData, cleanerData, availableMonths }: ViewSwitcherProps) {
  const [view, setView] = useState<View>('manager');
  const [managerData, setManagerData] = useState(initialManagerData);
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (filter: string) => {
    startTransition(async () => {
      const newData = await getFilteredManagerData(filter);
      setManagerData(newData);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-center mb-8">
        <div className="flex rounded-md bg-gray-200 p-1">
          <button
            onClick={() => setView('manager')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === 'manager'
                ? 'bg-white text-gray-900 shadow'
                : 'bg-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            管理員
          </button>
          <button
            onClick={() => setView('cleaner')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === 'cleaner'
                ? 'bg-white text-gray-900 shadow'
                : 'bg-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            清潔人員
          </button>
        </div>
      </div>

      <div>
        {view === 'manager' ? (
          <ManagerView 
            data={managerData} 
            availableMonths={availableMonths} 
            onFilterChange={handleFilterChange}
            isPending={isPending}
          />
        ) : (
          <CleanerView data={cleanerData} />
        )}
      </div>
    </div>
  );
}
