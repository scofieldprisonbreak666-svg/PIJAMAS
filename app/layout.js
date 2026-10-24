import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import { SITE_URL, STORE } from '@/lib/config';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});
const sans = Jost({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${STORE.name} | Pijamas femininos`,
  description: STORE.tagline,
  openGraph: { title: STORE.name, description: STORE.tagline, siteName: STORE.name, locale: 'pt_BR', type: 'website' },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
