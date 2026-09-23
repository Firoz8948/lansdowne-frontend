import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Admin Hub | Lansdowne',
  description: 'Store administration and operations',
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
