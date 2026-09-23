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

const IconCustomers = (p) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const IconSettings = (p) => (
  <Icon {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
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
      { href: '/admin/feeds', label: 'Catalog Feeds', icon: IconFeeds },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: IconOrders },
      { href: '/admin/payments', label: 'Payments', icon: IconPayments },
      { href: '/admin/promocodes', label: 'Promo Codes', icon: IconPromo },
      { href: '/admin/customers', label: 'Customers', icon: IconCustomers },
    ],
  },
  {
    label: 'Shipping',
    items: [
      { href: '/admin/shipping', label: 'Shipping', icon: IconShipping },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/metafields', label: 'Metafields', icon: IconMetafields },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: IconSettings },
    ],
  },
];

const IconMenu = (p) => (
  <Icon {...p}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </Icon>
);

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const sync = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
      else setCollapsed(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (pathname !== '/admin/login') {
      const token = authService.getAdminToken();
      if (!token) {
        router.push('/admin/login');
      }
    }
  }, [pathname, router]);

  // Close mobile sidebar after navigation
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [pathname, isMobile]);

  // If on login page, render full-screen without sidebar/header shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    authService.logoutAdmin();
    router.push('/admin/login');
  };

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className={styles.adminLayout}>
      <aside
        className={`${styles.sidebar} ${collapsed && !isMobile ? styles.sidebarCollapsed : ''} ${
          isMobile && !collapsed ? styles.sidebarMobileOpen : ''
        }`}
      >
          <div className={styles.brandRow}>
            {!(collapsed && !isMobile) && <div className={styles.brand}>Lansdowne Admin</div>}
            <button
              className={styles.collapseBtn}
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              type="button"
            >
              {collapsed && !isMobile ? <IconChevronRight /> : <IconChevronLeft />}
            </button>
          </div>

          <nav className={styles.nav}>
            {navSections.map((section, si) => (
              <div key={si} className={styles.navSection}>
                {section.label && !(collapsed && !isMobile) && (
                  <div className={styles.navSectionLabel}>{section.label}</div>
                )}
                {section.label && collapsed && !isMobile && (
                  <div className={styles.navSectionDivider} />
                )}
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                      title={collapsed && !isMobile ? item.label : undefined}
                    >
                      <ItemIcon />
                      {!(collapsed && !isMobile) && (
                        <span className={styles.navLabel}>{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}

            <div className={styles.navSpacer} />
            <button
              onClick={handleLogout}
              className={styles.navLink}
              title={collapsed && !isMobile ? 'Sign Out' : undefined}
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
            >
              <IconLogout />
              {!(collapsed && !isMobile) && <span className={styles.navLabel}>Sign Out</span>}
            </button>
          </nav>
      </aside>

      {isMobile && (
        <button
          type="button"
          className={`${styles.sidebarBackdrop} ${!collapsed ? styles.sidebarBackdropVisible : ''}`}
          aria-label="Close sidebar"
          aria-hidden={collapsed}
          tabIndex={collapsed ? -1 : 0}
          onClick={() => setCollapsed(true)}
        />
      )}

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {isMobile && collapsed && (
              <button
                type="button"
                className={styles.mobileMenuBtn}
                onClick={() => setCollapsed(false)}
                aria-label="Open sidebar"
              >
                <IconMenu />
              </button>
            )}
            <div className={styles.headerTitle}>Management Portal</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>admin</span>
          </div>
        </header>
        <div className={styles.contentBody}>{children}</div>
      </div>
    </div>
  );
}
