import EditExpenseForm from './EditExpenseForm';

interface EditExpensePageProps {
  params: Promise<{ id: string }>;
}

// This is the page component, a Server Component.
export default async function EditExpensePage({ params: paramsPromise }: EditExpensePageProps) {
  // It can be async and await the params promise.
  const { id } = await paramsPromise;

  // It renders the Client Component, passing the resolved `id` as a prop.
  return <EditExpenseForm id={id} />;
}