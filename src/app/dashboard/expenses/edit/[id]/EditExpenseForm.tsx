'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Expense } from '@prisma/client';

interface ExpenseFormData {
  date: string;
  category: string;
  amount: string;
  notes: string;
  extraNotes: string;
}

export default function EditExpenseForm({ id }: { id: string }) {
  const router = useRouter();
  const [record, setRecord] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ExpenseFormData>>({});

  useEffect(() => {
    async function fetchRecord() {
      try {
        const res = await fetch(`/api/expenses/${id}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data: Expense = await res.json();
        setRecord(data);
        // Initialize form data with existing record values
        setFormData({
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          category: data.category,
          amount: data.amount.toString(), // Convert Decimal to string for input
          notes: data.notes || '',
          extraNotes: data.extraNotes || '',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : (name === 'date' ? (value || null) : value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status} ${res.statusText}`);
      }

      router.push('/dashboard/expenses'); // Redirect back to the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-4">載入中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">錯誤: {error}</div>;
  }

  if (!record) {
    return <div className="p-4">找不到紀錄。</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">編輯支出紀錄</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">日期</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">類別</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">金額</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">備註</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div>
          <label htmlFor="extraNotes" className="block text-sm font-medium text-gray-700">額外備註</label>
          <textarea
            id="extraNotes"
            name="extraNotes"
            value={formData.extraNotes || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-2 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            儲存
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/expenses')}
            className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
