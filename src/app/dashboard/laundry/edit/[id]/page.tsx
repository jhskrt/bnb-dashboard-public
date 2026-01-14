import EditLaundryForm from './EditLaundryForm';

interface EditLaundryPageProps {
  params: Promise<{ id: string }>;
}

// This is the page component, a Server Component.
export default async function EditLaundryPage({ params: paramsPromise }: EditLaundryPageProps) {
  // It can be async and await the params promise.
  const { id } = await paramsPromise;

  // It renders the Client Component, passing the resolved `id` as a prop.
  return <EditLaundryForm id={id} />;
}