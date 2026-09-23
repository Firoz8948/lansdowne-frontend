'use client';

import { useEffect, useRef, useState } from 'react';
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
  const nextPath = searchParams.get('next') || '/account';
  const safeNext =
    nextPath.startsWith('/') &&
    !nextPath.startsWith('//') &&
    nextPath !== '/account/login'
      ? nextPath
      : '/account';

  const [mode, setMode] = useState('signin');
  const [step, setStep] = useState('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [resendIn, setResendIn] = useState(0);
  const [modeNotice, setModeNotice] = useState(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (authService.isLoggedIn()) {
      router.replace(safeNext === '/' ? '/account' : safeNext);
      return;
    }
    setCheckingAuth(false);
  }, [router, safeNext]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const otp = otpDigits.join('');

  const switchMode = (nextMode, notice = null) => {
    setMode(nextMode);
    setStep('details');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setModeNotice(notice);
    if (nextMode === 'signin') setName('');
  };

  const isAccountNotFound = (msg) =>
    /ACCOUNT_NOT_FOUND|no account|sign up first|create new account/i.test(msg || '');

  const isAccountExists = (msg) =>
    /ACCOUNT_EXISTS|already exists|please sign in|sign in from here/i.test(msg || '');

  const focusOtp = (index) => {
    const el = otpRefs.current[index];
    if (el) el.focus();
  };

  const handleOtpChange = (index, raw) => {
    const value = digitsOnly(raw).slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < OTP_LENGTH - 1) focusOtp(index + 1);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      focusOtp(index - 1);
    }
    if (e.key === 'ArrowLeft' && index > 0) focusOtp(index - 1);
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) focusOtp(index + 1);
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = digitsOnly(e.clipboardData.getData('text')).slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => {
      next[i] = d;
    });
    setOtpDigits(next);
    focusOtp(Math.min(pasted.length, OTP_LENGTH - 1));
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
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setResendIn(30);
      setModeNotice(null);
      setTimeout(() => focusOtp(0), 50);
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
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => focusOtp(0), 50);
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

      <main className={styles.main}>
        <div className={styles.formPanel}>
          <Link href="/" className={styles.backHome}>
            <ArrowLeft size={16} strokeWidth={1.75} />
            Back to store
          </Link>

          {checkingAuth ? (
            <p className={styles.sectionSubtitle}>Loading…</p>
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
                    ? `Code sent to +91 ${digitsOnly(phone)}`
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
                    modeNotice === 'create-first'
                      ? styles.modeNoticeSignup
                      : styles.modeNoticeSignin
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
                    <span className={styles.label} id="login-otp-label">
                      Enter OTP
                    </span>
                    <div
                      className={styles.otpBoxes}
                      role="group"
                      aria-labelledby="login-otp-label"
                      onPaste={handleOtpPaste}
                    >
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete={index === 0 ? 'one-time-code' : 'off'}
                          maxLength={1}
                          className={styles.otpBox}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || otp.length !== OTP_LENGTH}
                  >
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
                        setOtpDigits(Array(OTP_LENGTH).fill(''));
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
      </main>
    </div>
  );
}
