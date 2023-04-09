import dynamic from 'next/dynamic';

const AdminLayout = dynamic(() => import('@components/layouts/admin'));

export default function AppLayout({ ...props }) {
  return <AdminLayout {...props} />;
}
