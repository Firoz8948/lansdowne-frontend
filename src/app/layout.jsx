import './globals.css';
import { Plus_Jakarta_Sans, Arapey } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const fontHeading = Arapey({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata = {
  title: 'Lansdowne | Premium Collections',
  description: 'Curated premium products crafted for excellence and distinction.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontHeading.variable}`}>
      <body className={fontSans.className}>
        <Providers>
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
