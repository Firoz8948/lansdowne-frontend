import { Suspense } from 'react';
import CheckoutScreen from './CheckoutScreen';

export const metadata = {
  title: 'Checkout | Lansdowne',
  description: 'Complete your Lansdowne order securely.',
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            color: '#64748b',
          }}
        >
          Loading checkout…
        </div>
      }
    >
      <CheckoutScreen />
    </Suspense>
  );
}
