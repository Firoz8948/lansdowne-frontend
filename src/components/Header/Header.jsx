'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import authService from '@/lib/services/auth';
import styles from './header.module.css';

const DRAWER_ANIMATION_MS = 300;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);
  const [accountHref, setAccountHref] = useState('/account/login');
  const pathname = usePathname();
  const { totalItems } = useCart();

  useEffect(() => {
    setAccountHref(authService.isLoggedIn() ? '/account' : '/account/login');
  }, [pathname]);

  const closeMobileMenu = useCallback(() => {
    if (!mobileMenuOpen || mobileMenuClosing) return;
    setMobileMenuClosing(true);
    window.setTimeout(() => {
      setMobileMenuOpen(false);
      setMobileMenuClosing(false);
    }, DRAWER_ANIMATION_MS);
  }, [mobileMenuOpen, mobileMenuClosing]);

  const openMobileMenu = () => {
    setMobileMenuClosing(false);
    setMobileMenuOpen(true);
  };

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) closeMobileMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen || mobileMenuClosing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, mobileMenuClosing]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Watch & Shop', href: '/watch-and-shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact-us' },
  ];

  const isHome = pathname === '/';

  return (
    <>
      <header className={`${styles.header} ${isHome ? styles.headerHome : styles.headerSolid}`}>
        <div className={styles.inner}>
          
          {/* ================= LEFT SECTION ================= */}
          <div className={styles.leftSection}>
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={openMobileMenu}
              aria-label="Open Navigation Menu"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>

            {/* Desktop Extreme Left: text_logo.svg */}
            <Link href="/" className={styles.textLogoLink}>
              <Image
                src="/assets/text_logo.svg"
                alt="Lansdowne"
                width={136}
                height={46}
                className={styles.textLogoImg}
                priority
              />
            </Link>

            {/* Desktop Nav Links (Home, Shop, Watch & Shop) centered between text logo and main logo */}
            <nav className={`${styles.desktopNav} ${styles.leftNav}`}>
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ================= CENTER SECTION: main_logo.svg ================= */}
          <div className={styles.centerSection}>
            <Link href="/" className={styles.mainLogoLink} aria-label="Lansdowne Home">
              <Image
                src="/assets/main_logo.svg"
                alt="Lansdowne Emblem"
                width={64}
                height={64}
                className={styles.mainLogoImg}
                priority
              />
            </Link>
          </div>

          {/* ================= RIGHT SECTION ================= */}
          <div className={styles.rightSection}>
            {/* Desktop Nav Links (About, Contact, Admin) left-aligned towards center main logo */}
            <nav className={`${styles.desktopNav} ${styles.rightNav}`}>
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
                >
                  {link.label}
                </Link>
              ))}

            </nav>

            {/* Icon Actions */}
            <div className={styles.iconActions}>
              <Link href="/cart" className={styles.iconBtn} aria-label="Shopping Cart">
                <ShoppingCart size={20} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className={styles.cartBadge}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
              <Link href={accountHref} className={styles.iconBtn} aria-label="My Account">
                <User size={20} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* ================= MOBILE DRAWER MENU ================= */}
      {(mobileMenuOpen || mobileMenuClosing) && (
        <div
          className={`${styles.drawerOverlay} ${mobileMenuClosing ? styles.drawerOverlayClosing : ''}`}
          onClick={closeMobileMenu}
        >
          <div
            className={`${styles.drawerContent} ${mobileMenuClosing ? styles.drawerContentClosing : ''}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.drawerHeader}>
              <Link href="/" className={styles.drawerLogoLink} onClick={closeMobileMenu}>
                <Image
                  src="/assets/text_logo.svg"
                  alt="Lansdowne"
                  width={140}
                  height={28}
                  className={styles.textLogoImg}
                />
              </Link>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={closeMobileMenu}
                aria-label="Close Navigation Menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav className={styles.drawerNav}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.drawerNavLink} ${pathname === link.href ? styles.drawerNavLinkActive : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span>{link.label}</span>
                  <ArrowRight size={16} className={styles.drawerLinkArrow} />
                </Link>
              ))}

              <div className={styles.drawerDivider} />

              <Link
                href="/faqs"
                className={styles.drawerSecondaryLink}
                onClick={closeMobileMenu}
              >
                FAQs & Support
              </Link>
              <Link
                href="/policy/privacy-policy"
                className={styles.drawerSecondaryLink}
                onClick={closeMobileMenu}
              >
                Privacy Policy
              </Link>
              <Link
                href="/policy/terms-and-conditions"
                className={styles.drawerSecondaryLink}
                onClick={closeMobileMenu}
              >
                Terms & Conditions
              </Link>
              <Link
                href="/policy/shipping-policy"
                className={styles.drawerSecondaryLink}
                onClick={closeMobileMenu}
              >
                Shipping Policy
              </Link>
              <Link
                href="/policy/refund-policy"
                className={styles.drawerSecondaryLink}
                onClick={closeMobileMenu}
              >
                Returns & Refunds
              </Link>

            </nav>

            <div className={styles.drawerFooter}>
              <p>© {new Date().getFullYear()} Lansdowne. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
