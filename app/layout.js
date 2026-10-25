import { Playfair_Display, Jost, Dancing_Script } from 'next/font/google';
import './globals.css';
import { SITE_URL, STORE } from '@/lib/config';

// Títulos: serifada de alto contraste, com itálico
const serif = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

// Texto corrido: sem serifa limpa e redonda
const sans = Jost({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

// Só para a logo "Dela's"
const script = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${STORE.name} | Pijamas femininos`,
  description: STORE.tagline,
  openGraph: { title: STORE.name, description: STORE.tagline, siteName: STORE.name, locale: 'pt_BR', type: 'website' },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
