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

  const [mode, setMode] = useState('signin'); // signin | signup
  const [step, setStep] = useState('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  /** Shown after auto tab switch: 'create-first' | 'signin-here' | null */
  const [modeNotice, setModeNotice] = useState(null);

  useEffect(() => {
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

  const switchMode = (nextMode, notice = null) => {
    setMode(nextMode);
    setStep('details');
    setOtp('');
    setModeNotice(notice);
    if (nextMode === 'signin') setName('');
  };

  const isAccountNotFound = (msg) =>
    /ACCOUNT_NOT_FOUND|no account|sign up first|create new account/i.test(msg || '');

  const isAccountExists = (msg) =>
    /ACCOUNT_EXISTS|already exists|please sign in|sign in from here/i.test(msg || '');

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

    if (mode === 'signup' && !trimmedName) {
      toast.error('Please enter your name');
      return;
    }
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const data = await authService.sendOtp(
        mobile,
        mode === 'signup' ? trimmedName : '',
        mode
      );
      toast.success(data?.message || 'OTP sent successfully');
      if (data?.debug && data?.otp) {
        toast(`Debug OTP: ${data.otp}`, { icon: '🔑' });
      }
      setStep('otp');
      setOtp('');
      setResendIn(30);
      setModeNotice(null);
    } catch (err) {
      const msg = err.message || 'Failed to send OTP';
      if (mode === 'signin' && isAccountNotFound(msg)) {
        setPhone(mobile);
        switchMode('signup', 'create-first');
        toast('Create new account first', { icon: '👋' });
      } else if (mode === 'signup' && isAccountExists(msg)) {
        setPhone(mobile);
        switchMode('signin', 'signin-here');
        toast('Account already exists — Sign in from here', { icon: '✓' });
      } else {
        toast.error(msg);
      }
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
      await authService.verifyOtp(
        mobile,
        code,
        mode === 'signup' ? trimmedName : '',
        mode
      );
      toast.success(mode === 'signup' ? 'Account created' : 'Login successful');
      router.replace(safeNext);
    } catch (err) {
      const msg = err.message || 'Invalid OTP';
      if (mode === 'signin' && isAccountNotFound(msg)) {
        setPhone(mobile);
        switchMode('signup', 'create-first');
        toast('Create new account first', { icon: '👋' });
      } else if (mode === 'signup' && isAccountExists(msg)) {
        setPhone(mobile);
        switchMode('signin', 'signin-here');
        toast('Account already exists — Sign in from here', { icon: '✓' });
      } else {
        toast.error(msg);
      }
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
      const data = await authService.sendOtp(
        mobile,
        mode === 'signup' ? trimmedName : '',
        mode
      );
      toast.success(data?.message || 'OTP resent');
      if (data?.debug && data?.otp) {
        toast(`Debug OTP: ${data.otp}`, { icon: '🔑' });
      }
      setResendIn(30);
      setOtp('');
    } catch (err) {
      const msg = err.message || 'Failed to resend OTP';
      if (mode === 'signin' && isAccountNotFound(msg)) {
        setPhone(mobile);
        switchMode('signup', 'create-first');
        toast('Create new account first', { icon: '👋' });
      } else if (mode === 'signup' && isAccountExists(msg)) {
        setPhone(mobile);
        switchMode('signin', 'signin-here');
        toast('Account already exists — Sign in from here', { icon: '✓' });
      } else {
        toast.error(msg);
      }
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
              {step === 'otp'
                ? 'VERIFY OTP'
                : mode === 'signup'
                  ? 'CREATE ACCOUNT'
                  : 'WELCOME BACK'}
            </h1>
            <p className={styles.sectionSubtitle}>
              {step === 'otp'
                ? `Enter the ${OTP_LENGTH}-digit code sent to +91 ${digitsOnly(phone)}`
                : modeNotice === 'create-first'
                  ? 'Create new account first'
                  : modeNotice === 'signin-here'
                    ? 'Account already exists — Sign in from here'
                    : mode === 'signup'
                      ? 'Sign up with your name and mobile number'
                      : 'Sign in with your mobile number'}
            </p>
          </div>

          {step === 'details' && modeNotice && (
            <div
              className={`${styles.modeNotice} ${
                modeNotice === 'create-first' ? styles.modeNoticeSignup : styles.modeNoticeSignin
              }`}
              role="status"
            >
              {modeNotice === 'create-first'
                ? 'No account found for this number. Create new account first.'
                : 'Account already exists. Sign in from here.'}
            </div>
          )}

          {step === 'details' && (
            <div className={styles.tabs} role="tablist" aria-label="Account mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                className={`${styles.tab} ${mode === 'signin' ? styles.tabActive : ''}`}
                onClick={() => switchMode('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
                onClick={() => switchMode('signup')}
              >
                Sign up
              </button>
            </div>
          )}

          {step === 'details' ? (
            <form className={styles.form} onSubmit={handleSendOtp}>
              {mode === 'signup' && (
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
              )}

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
                    onChange={(e) => {
                      setPhone(digitsOnly(e.target.value).slice(0, 10));
                      if (modeNotice) setModeNotice(null);
                    }}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>

              {mode === 'signin' ? (
                <p className={styles.switchHint}>
                  New customer?{' '}
                  <button
                    type="button"
                    className={styles.switchLink}
                    onClick={() => switchMode('signup')}
                  >
                    Sign up from here
                  </button>
                </p>
              ) : (
                <p className={styles.switchHint}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className={styles.switchLink}
                    onClick={() => switchMode('signin')}
                  >
                    Sign in from here
                  </button>
                </p>
              )}
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
                {loading
                  ? 'Verifying…'
                  : mode === 'signup'
                    ? 'Verify & Sign up'
                    : 'Verify & Sign in'}
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
