import { getCategories } from '@/lib/data';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export const revalidate = 30;

export default async function SiteLayout({ children }) {
  const categories = await getCategories();
  return (
    <CartProvider>
      <Header categories={categories} />
      <main>{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
      <WhatsAppFloat />
    </CartProvider>
  );
}
