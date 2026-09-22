import { Suspense } from 'react';
import CustomerLoginScreen from './CustomerLoginScreen';

export const metadata = {
  title: 'Login | Lansdowne',
  description: 'Sign in to your Lansdowne account with mobile OTP.',
};

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#0f172a',
            color: '#fff',
          }}
        >
          Loading…
        </div>
      }
    >
      <CustomerLoginScreen />
    </Suspense>
  );
}
