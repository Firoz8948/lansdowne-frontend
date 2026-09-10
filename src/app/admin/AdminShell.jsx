'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './admin.module.css';
import authService from '@/lib/services/auth';

/* ── SVG Icon Components (Lucide-style, 20x20) ── */

const Icon = ({ children, size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
    {...props}
  >
    {children}
  </svg>
);

const IconDashboard = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icon>
);

const IconProducts = (p) => (
  <Icon {...p}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </Icon>
);

const IconCategories = (p) => (
  <Icon {...p}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </Icon>
);

const IconBanners = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </Icon>
);

const IconFeeds = (p) => (
  <Icon {...p}>
    <path d="M4 11a9 9 0 0 1 9 9" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1" />
  </Icon>
);

const IconOrders = (p) => (
  <Icon {...p}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </Icon>
);

const IconPayments = (p) => (
  <Icon {...p}>
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </Icon>
);

const IconPromo = (p) => (
  <Icon {...p}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </Icon>
);

const IconShipping = (p) => (
  <Icon {...p}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </Icon>
);

const IconShippingZones = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </Icon>
);

const IconContact = (p) => (
  <Icon {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);

const IconMeta = (p) => (
  <Icon {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icon>
);

const IconMetafields = (p) => (
  <Icon {...p}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
  </Icon>
);

const IconLogout = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);

const IconStore = (p) => (
  <Icon {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Icon>
);

const IconChevronLeft = (p) => (
  <Icon size={18} {...p}>
    <polyline points="15 18 9 12 15 6" />
  </Icon>
);

const IconChevronRight = (p) => (
  <Icon size={18} {...p}>
    <polyline points="9 18 15 12 9 6" />
  </Icon>
);

/* ── Navigation config ── */

const navSections = [
  {
    label: null,
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: IconDashboard },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: IconProducts },
      { href: '/admin/categories', label: 'Categories', icon: IconCategories },
      { href: '/admin/banners', label: 'Banners', icon: IconBanners },
      { href: '/admin/feeds', label: 'Catalog Feeds', icon: IconFeeds },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: IconOrders },
      { href: '/admin/payments', label: 'Payments', icon: IconPayments },
      { href: '/admin/promocodes', label: 'Promo Codes', icon: IconPromo },
    ],
  },
  {
    label: 'Shipping',
    items: [
      { href: '/admin/shipping', label: 'Shipping', icon: IconShipping },
      { href: '/admin/shipping-zones', label: 'Shipping Zones', icon: IconShippingZones },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/contact', label: 'Contact Messages', icon: IconContact },
      { href: '/admin/meta', label: 'Meta / SEO', icon: IconMeta },
      { href: '/admin/metafields', label: 'Metafields', icon: IconMetafields },
    ],
  },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (pathname !== '/admin/login') {
      const token = authService.getToken();
      if (!token) {
        router.push('/admin/login');
      }
    }
  }, [pathname, router]);

  // If on login page, render full-screen without sidebar/header shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    authService.logout();
    router.push('/admin/login');
  };

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className={styles.adminLayout}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.brandRow}>
          {!collapsed && <div className={styles.brand}>Lansdowne Admin</div>}
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
          </button>
        </div>

        <nav className={styles.nav}>
          {navSections.map((section, si) => (
            <div key={si} className={styles.navSection}>
              {section.label && !collapsed && (
                <div className={styles.navSectionLabel}>{section.label}</div>
              )}
              {section.label && collapsed && (
                <div className={styles.navSectionDivider} />
              )}
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <ItemIcon />
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}

          <div className={styles.navSpacer} />
          <button
            onClick={handleLogout}
            className={styles.navLink}
            title={collapsed ? 'Sign Out' : undefined}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            <IconLogout />
            {!collapsed && <span className={styles.navLabel}>Sign Out</span>}
          </button>
          <Link
            href="/"
            className={styles.navLink}
            title={collapsed ? 'Back to Store' : undefined}
          >
            <IconStore />
            {!collapsed && <span className={styles.navLabel}>Back to Store</span>}
          </Link>
        </nav>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>Management Portal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>admin</span>
          </div>
        </header>
        <div className={styles.contentBody}>{children}</div>
      </div>
    </div>
  );
}
