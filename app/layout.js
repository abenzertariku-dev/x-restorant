import './globals.css';
import { Toaster } from '@/components/ui';

export const metadata = {
  title: 'Restaurant',
  description: 'Table and delivery ordering',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ea580c',
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
