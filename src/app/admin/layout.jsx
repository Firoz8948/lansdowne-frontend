import AdminShell from './AdminShell';

export const metadata = {
  title: 'Admin Hub | Lansdowne',
  description: 'Store administration and operations',
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
