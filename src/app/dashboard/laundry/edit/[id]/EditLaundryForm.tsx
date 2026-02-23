'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LaundryRecord } from '@prisma/client';

type LaundryFormData = Omit<LaundryRecord, 'deliveryDate' | 'retrievalDate'> & {
  deliveryDate: string;
  retrievalDate: string;
};

export default function EditLaundryForm({ id }: { id: string }) {
  const router = useRouter();
  const [record, setRecord] = useState<LaundryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LaundryFormData>>({});

  useEffect(() => {
    async function fetchRecord() {
      try {
        const res = await fetch(`/api/laundry/${id}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data: LaundryRecord = await res.json();
        setRecord(data);
        // Initialize form data with existing record values
        setFormData({
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString().split('T')[0] : '',
          retrievalDate: data.retrievalDate ? new Date(data.retrievalDate).toISOString().split('T')[0] : '',
          duvetCovers: data.duvetCovers,
          bedSheets: data.bedSheets,
          pillowcases: data.pillowcases,
          largeTowels: data.largeTowels,
          smallTowels: data.smallTowels,
          notes: data.notes || '',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Date') ? (value || null) : (name.includes('Towels') || name.includes('Sheets') || name.includes('Covers') || name.includes('pillowcases') ? parseInt(value, 10) || 0 : value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`/api/laundry/${id}`, {
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

      router.push('/dashboard/laundry'); // Redirect back to the list
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
      <h1 className="text-2xl font-bold mb-4">編輯送洗紀錄</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">送洗日期</label>
          <input
            type="date"
            id="deliveryDate"
            name="deliveryDate"
            value={formData.deliveryDate || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="retrievalDate" className="block text-sm font-medium text-gray-700">取回日期</label>
          <input
            type="date"
            id="retrievalDate"
            name="retrievalDate"
            value={formData.retrievalDate || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="duvetCovers" className="block text-sm font-medium text-gray-700">被套</label>
            <input type="number" id="duvetCovers" name="duvetCovers" value={formData.duvetCovers || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="bedSheets" className="block text-sm font-medium text-gray-700">床單</label>
            <input type="number" id="bedSheets" name="bedSheets" value={formData.bedSheets || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="pillowcases" className="block text-sm font-medium text-gray-700">枕頭套</label>
            <input type="number" id="pillowcases" name="pillowcases" value={formData.pillowcases || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="largeTowels" className="block text-sm font-medium text-gray-700">大毛巾</label>
            <input type="number" id="largeTowels" name="largeTowels" value={formData.largeTowels || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="smallTowels" className="block text-sm font-medium text-gray-700">小毛巾</label>
            <input type="number" id="smallTowels" name="smallTowels" value={formData.smallTowels || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
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
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            儲存
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/laundry')}
            className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
