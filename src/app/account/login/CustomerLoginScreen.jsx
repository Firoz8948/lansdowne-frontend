'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import authService from '@/lib/services/auth';
import styles from './login.module.css';

const OTP_LENGTH = 4;

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export default function CustomerLoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/';
  const safeNext =
    nextPath.startsWith('/') && !nextPath.startsWith('//') && nextPath !== '/account/login'
      ? nextPath
      : '/';

  const [step, setStep] = useState('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Stay on the page — do not auto-redirect (that felt like "going back").
    // Only customer_token counts; admin sessions must not affect this screen.
    if (authService.isLoggedIn()) {
      const user = authService.getUser();
      setAlreadyLoggedIn(true);
      setUserName(user?.name || user?.full_name || '');
    } else {
      setAlreadyLoggedIn(false);
      setUserName('');
    }
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const handleSignOut = () => {
    authService.logout();
    setAlreadyLoggedIn(false);
    setUserName('');
    setStep('details');
    setOtp('');
    toast.success('Signed out');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const mobile = digitsOnly(phone);

    if (!trimmedName) {
      toast.error('Please enter your name');
      return;
    }
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const data = await authService.sendOtp(mobile, trimmedName);
      toast.success(data?.message || 'OTP sent successfully');
      if (data?.debug && data?.otp) {
        toast(`Debug OTP: ${data.otp}`, { icon: '🔑' });
      }
      setStep('otp');
      setOtp('');
      setResendIn(30);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const mobile = digitsOnly(phone);
    const code = digitsOnly(otp);

    if (code.length !== OTP_LENGTH) {
      toast.error(`Please enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }

    try {
      setLoading(true);
      await authService.verifyOtp(mobile, code, trimmedName);
      toast.success('Login successful');
      router.replace(safeNext);
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || loading) return;
    const trimmedName = name.trim();
    const mobile = digitsOnly(phone);
    try {
      setLoading(true);
      const data = await authService.sendOtp(mobile, trimmedName);
      toast.success(data?.message || 'OTP resent');
      if (data?.debug && data?.otp) {
        toast(`Debug OTP: ${data.otp}`, { icon: '🔑' });
      }
      setResendIn(30);
      setOtp('');
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <div className={styles.formPanel}>
      <Link href="/" className={styles.backHome}>
        <ArrowLeft size={16} strokeWidth={1.75} />
        Back to store
      </Link>

      {alreadyLoggedIn ? (
        <>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>YOU&apos;RE SIGNED IN</h1>
            <p className={styles.sectionSubtitle}>
              {userName ? `Welcome back, ${userName}` : 'Your session is still active'}
            </p>
          </div>
          <div className={styles.form}>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => router.push(safeNext)}
            >
              Continue shopping
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={handleSignOut}>
              Sign out &amp; use another number
            </button>
          </div>
        </>
      ) : (
        <>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>
          {step === 'details' ? 'CUSTOMER LOGIN' : 'VERIFY OTP'}
        </h1>
        <p className={styles.sectionSubtitle}>
          {step === 'details'
            ? 'Sign in'
            : `Enter the ${OTP_LENGTH}-digit code sent to +91 ${digitsOnly(phone)}`}
        </p>
      </div>

      {step === 'details' ? (
        <form className={styles.form} onSubmit={handleSendOtp}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-name">
              Full Name
            </label>
            <input
              id="login-name"
              type="text"
              className={styles.input}
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-phone">
              Mobile Number
            </label>
            <div className={styles.phoneRow}>
              <span className={styles.phonePrefix}>+91</span>
              <input
                id="login-phone"
                type="tel"
                inputMode="numeric"
                className={`${styles.input} ${styles.phoneInput}`}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, 10))}
                autoComplete="tel"
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleVerifyOtp}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-otp">
              One-Time Password
            </label>
            <input
              id="login-otp"
              type="text"
              inputMode="numeric"
              className={`${styles.input} ${styles.otpInput}`}
              placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
              value={otp}
              onChange={(e) => setOtp(digitsOnly(e.target.value).slice(0, OTP_LENGTH))}
              autoComplete="one-time-code"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </button>

          <div className={styles.otpActions}>
            <button
              type="button"
              className={styles.textBtn}
              onClick={() => {
                setStep('details');
                setOtp('');
              }}
            >
              Change number
            </button>
            <button
              type="button"
              className={styles.textBtn}
              onClick={handleResend}
              disabled={resendIn > 0 || loading}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}

      <p className={styles.legalNote}>
        By continuing, you agree to our{' '}
        <Link href="/policy/terms-and-conditions">Terms</Link> and{' '}
        <Link href="/policy/privacy-policy">Privacy Policy</Link>.
      </p>
        </>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      <aside className={styles.heroPanel}>
        <Image
          src="/images/banners/hero_left.webp"
          alt=""
          fill
          priority
          sizes="50vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroCopy}>
          <span className={styles.heroTag}>Lansdowne</span>
          <h2 className={styles.heroTitle}>
            Crafted for those
            <br />
            who notice the details
          </h2>
          <p className={styles.heroText}>
            Sign in to track orders, save your details for faster checkout, and
            shop premium leather essentials made for everyday distinction.
          </p>
        </div>
      </aside>

      <div className={styles.mobileBg} aria-hidden="true">
        <Image
          src="/images/banners/hero_left.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.mobileOverlay} />
      </div>

      <main className={styles.main}>{loginForm}</main>
    </div>
  );
}
