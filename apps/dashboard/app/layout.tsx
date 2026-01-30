import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Narrify - AI-Powered Interactive Tours That Actually See',
  description: 'The first AI tour platform powered by Claude Vision. Create interactive product tours that understand your UI visually.',
  keywords: ['AI tours', 'product tours', 'onboarding', 'Claude Vision', 'interactive guide'],
  openGraph: {
    title: 'Narrify - AI-Powered Interactive Tours',
    description: 'Create interactive product tours that understand your UI visually.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
