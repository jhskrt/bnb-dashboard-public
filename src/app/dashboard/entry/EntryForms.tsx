'use client';

import { useState, useTransition, useEffect } from 'react';
import { createExpense, createCheckIn, createLaundry } from '../actions';

const FormRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <label className="text-sm font-medium text-gray-700 md:text-right">{label}</label>
        <div className="md:col-span-2">{children}</div>
    </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
);

const TextareaInput = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} rows={3} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
);

const ExpenseForm = () => {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        startTransition(async () => {
            const response = await createExpense(formData);
            setResult(response);
            if (response.success) {
                (event.target as HTMLFormElement).reset();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-b-lg space-y-6">
            <h2 className="text-xl font-semibold mb-4">新增支出紀錄</h2>
            <FormRow label="日期">
                <TextInput name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </FormRow>
            <FormRow label="類別">
                <TextInput name="category" type="text" placeholder="例如：送洗費、平台抽成、水電瓦斯、維修" required />
            </FormRow>
            <FormRow label="金額">
                <TextInput name="amount" type="number" step="0.01" placeholder="例如：300" required />
            </FormRow>
            <FormRow label="備註">
                <TextareaInput name="notes" placeholder="(選填)" />
            </FormRow>
            <FormRow label="額外備註">
                <TextareaInput name="extraNotes" placeholder="(選填)" />
            </FormRow>
            <div className="flex justify-end items-center space-x-4">
                {result && (
                    <p className={`${result.success ? 'text-green-600' : 'text-red-600'} text-sm`}>
                        {result.message}
                    </p>
                )}
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isPending ? '儲存中...' : '儲存'}
                </button>
            </div>
        </form>
    );
};

const CheckInForm = () => {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
    const [checkOutDate, setCheckOutDate] = useState('');
    const [numberOfNights, setNumberOfNights] = useState(0);
    const [numberOfHolidays, setNumberOfHolidays] = useState(0);

    useEffect(() => {
        const calculateNightsAndHolidays = () => {
            if (checkInDate && checkOutDate) {
                const start = new Date(checkInDate);
                const end = new Date(checkOutDate);
                if (start >= end) {
                    setNumberOfNights(0);
                    setNumberOfHolidays(0);
                    return;
                }

                const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
                setNumberOfNights(nights);

                let holidayCount = 0;
                let currentDate = new Date(start);
                while (currentDate < end) {
                    const day = currentDate.getDay();
                    // 5 = Friday, 6 = Saturday
                    if (day === 5 || day === 6) {
                        holidayCount++;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                setNumberOfHolidays(holidayCount);
            }
        };

        calculateNightsAndHolidays();
    }, [checkInDate, checkOutDate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set('numberOfNights', String(numberOfNights));
        formData.set('numberOfHolidays', String(numberOfHolidays));

        startTransition(async () => {
            const response = await createCheckIn(formData);
            setResult(response);
            if (response.success) {
                (event.target as HTMLFormElement).reset();
                setCheckInDate(new Date().toISOString().split('T')[0]);
                setCheckOutDate('');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-b-lg space-y-6">
            <h2 className="text-xl font-semibold mb-4">新增入住紀錄</h2>
            <FormRow label="入住日期">
                <TextInput name="checkInDate" type="date" required value={checkInDate} onChange={e => setCheckInDate(e.target.value)} />
            </FormRow>
            <FormRow label="退房日期">
                <TextInput name="checkOutDate" type="date" required value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} />
            </FormRow>
            <FormRow label="人數">
                <TextInput name="numberOfPeople" type="number" placeholder="例如：2" required />
            </FormRow>
            <FormRow label="房間數">
                <TextInput name="numberOfRooms" type="number" placeholder="例如：1" required />
            </FormRow>
            <FormRow label="入住夜數">
                <TextInput name="numberOfNights" type="number" value={numberOfNights} disabled />
            </FormRow>
            <FormRow label="假日夜數">
                <TextInput name="numberOfHolidays" type="number" value={numberOfHolidays} disabled />
            </FormRow>
            <FormRow label="備註">
                <TextareaInput name="notes" placeholder="(選填)" />
            </FormRow>
            <div className="flex justify-end items-center space-x-4">
                {result && (
                    <p className={`${result.success ? 'text-green-600' : 'text-red-600'} text-sm`}>
                        {result.message}
                    </p>
                )}
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isPending ? '儲存中...' : '儲存'}
                </button>
            </div>
        </form>
    );
};

const LaundryForm = () => {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [items, setItems] = useState({ duvetCovers: '', bedSheets: '', pillowcases: '', largeTowels: '', smallTowels: '' });

    const handleQuickEntryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length <= 5) {
            setItems({
                duvetCovers: value[0] || '',
                bedSheets: value[1] || '',
                pillowcases: value[2] || '',
                largeTowels: value[3] || '',
                smallTowels: value[4] || '',
            });
        }
    };

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setItems(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        // Set item values from state
        Object.entries(items).forEach(([key, value]) => {
            formData.set(key, value);
        });

        startTransition(async () => {
            const response = await createLaundry(formData);
            setResult(response);
            if (response.success) {
                (event.target as HTMLFormElement).reset();
                setItems({ duvetCovers: '', bedSheets: '', pillowcases: '', largeTowels: '', smallTowels: '' });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-b-lg space-y-6">
            <h2 className="text-xl font-semibold mb-4">新增送洗紀錄</h2>
            <FormRow label="快速輸入 (5位數)">
                <TextInput 
                    type="text" 
                    maxLength={5}
                    placeholder="被單、床單、枕套、大毛巾、小毛巾"
                    onChange={handleQuickEntryChange}
                />
            </FormRow>
            <hr className="my-4" />
            <FormRow label="送洗日期">
                <TextInput name="deliveryDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </FormRow>
            <FormRow label="取回日期">
                <TextInput name="retrievalDate" type="date" />
            </FormRow>
            <FormRow label="被單">
                <TextInput name="duvetCovers" type="number" placeholder="例如：4" required value={items.duvetCovers} onChange={handleItemChange} />
            </FormRow>
            <FormRow label="床單">
                <TextInput name="bedSheets" type="number" placeholder="例如：4" required value={items.bedSheets} onChange={handleItemChange} />
            </FormRow>
            <FormRow label="枕頭套">
                <TextInput name="pillowcases" type="number" placeholder="例如：8" required value={items.pillowcases} onChange={handleItemChange} />
            </FormRow>
            <FormRow label="大毛巾">
                <TextInput name="largeTowels" type="number" placeholder="例如：8" required value={items.largeTowels} onChange={handleItemChange} />
            </FormRow>
            <FormRow label="小毛巾">
                <TextInput name="smallTowels" type="number" placeholder="例如：8" required value={items.smallTowels} onChange={handleItemChange} />
            </FormRow>
            <FormRow label="備註">
                <TextareaInput name="notes" placeholder="(選填)" />
            </FormRow>
            <div className="flex justify-end items-center space-x-4">
                {result && (
                    <p className={`${result.success ? 'text-green-600' : 'text-red-600'} text-sm`}>
                        {result.message}
                    </p>
                )}
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isPending ? '儲存中...' : '儲存'}
                </button>
            </div>
        </form>
    );
};

type FormType = 'expense' | 'check-in' | 'laundry';

const TABS: { id: FormType; label: string }[] = [
    { id: 'expense', label: '支出' },
    { id: 'check-in', label: '入住紀錄' },
    { id: 'laundry', label: '送洗紀錄' },
];

export default function EntryForms() {
    const [activeTab, setActiveTab] = useState<FormType>('expense');

    const renderForm = () => {
        switch (activeTab) {
            case 'expense': return <ExpenseForm />;
            case 'check-in': return <CheckInForm />;
            case 'laundry': return <LaundryForm />;
            default: return null;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-4">
                {renderForm()}
            </div>
        </div>
    );
}