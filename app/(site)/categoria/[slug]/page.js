import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategories, getProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { STORE } from '@/lib/config';

export const revalidate = 30;

const SPECIAL = {
  todos: { name: 'Todos os pijamas', opts: {} },
  novidades: { name: 'Novidades', opts: { limit: 24 } },
  promocoes: { name: 'Promoções', opts: { onSale: true } },
};

async function resolve(slug) {
  if (SPECIAL[slug]) return { name: SPECIAL[slug].name, opts: SPECIAL[slug].opts };
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return null;
  return { name: cat.name, opts: { categoryId: cat.id } };
}

export async function generateMetadata({ params }) {
  const r = await resolve(params.slug);
  if (!r) return {};
  return { title: `${r.name} | ${STORE.name}`, description: `${r.name} - ${STORE.tagline}` };
}

export default async function CategoryPage({ params }) {
  const r = await resolve(params.slug);
  if (!r) notFound();
  const products = await getProducts(r.opts);

  return (
    <section className="wrap sec">
      <nav className="crumbs">
        <Link href="/">Início</Link> / <span>{r.name}</span>
      </nav>
      <div className="sec-head">
        <h1 className="page-title">{r.name}</h1>
        <span className="muted">{products.length} {products.length === 1 ? 'peça' : 'peças'}</span>
      </div>
      {products.length === 0 ? (
        <div className="empty">
          <p>Ainda não há peças nesta categoria.</p>
          <Link href="/categoria/todos" className="btn">
            Ver todos os pijamas
          </Link>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  );
}
