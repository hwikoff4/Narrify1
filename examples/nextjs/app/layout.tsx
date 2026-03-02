import { Providers } from './providers';

export const metadata = {
  title: 'Narrify Next.js Example',
  description: 'Next.js App Router integration with Narrify',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
