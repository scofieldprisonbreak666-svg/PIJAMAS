import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct } from '@/lib/data';
import { parseId, productPath } from '@/lib/format';
import { STORE } from '@/lib/config';
import ProductClient from './ProductClient';

export const revalidate = 30;

export async function generateMetadata({ params }) {
  const p = await getProduct(parseId(params.id));
  if (!p) return {};
  const desc = (p.description || STORE.tagline).slice(0, 160);
  return {
    title: `${p.name} | ${STORE.name}`,
    description: desc,
    openGraph: { title: p.name, description: desc, images: p.images?.[0] ? [{ url: p.images[0] }] : [], type: 'website' },
  };
}

export default async function ProductPage({ params }) {
  const p = await getProduct(parseId(params.id));
  if (!p) notFound();

  return (
    <section className="wrap sec">
      <nav className="crumbs">
        <Link href="/">Início</Link> /{' '}
        {p.categories ? (
          <>
            <Link href={`/categoria/${p.categories.slug}`}>{p.categories.name}</Link> /{' '}
          </>
        ) : null}
        <span>{p.name}</span>
      </nav>
      <ProductClient product={p} path={productPath(p)} />
    </section>
  );
}
