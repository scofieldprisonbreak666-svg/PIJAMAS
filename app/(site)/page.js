import Link from 'next/link';
import { getCategories, getProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { STORE } from '@/lib/config';

export const revalidate = 30;

export default async function Home() {
  const [cats, featured, latest, sale] = await Promise.all([
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getProducts({ limit: 8 }),
    getProducts({ onSale: true, limit: 4 }),
  ]);
  const heroImg = (featured[0] || latest[0])?.images?.[0];
  const hasProducts = latest.length > 0;

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <h1>Pijamas femininos para descansar com estilo</h1>
            <p>Peças confortáveis para as suas noites e manhãs de preguiça. Escolha aqui e finalize pelo WhatsApp.</p>
            <Link href="/categoria/todos" className="btn">
              Ver todos os pijamas
            </Link>
          </div>
          <div className="arch" aria-hidden={!heroImg}>
            {heroImg ? <img src={heroImg} alt="" /> : <span className="monogram">S</span>}
          </div>
        </div>
      </section>

      {cats.length > 0 && (
        <section className="wrap chips" aria-label="Categorias">
          {cats.map((c) => (
            <Link key={c.id} href={`/categoria/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </section>
      )}

      {!hasProducts && (
        <section className="wrap empty">
          <h2>Novas peças chegando</h2>
          <p>Em breve a coleção {STORE.name} estará aqui.</p>
        </section>
      )}

      {featured.length > 0 && (
        <section className="wrap sec">
          <div className="sec-head">
            <h2>Destaques</h2>
            <Link href="/categoria/todos">Ver tudo</Link>
          </div>
          <div className="grid">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="wrap sec">
          <div className="sec-head">
            <h2>Novidades</h2>
            <Link href="/categoria/novidades">Ver tudo</Link>
          </div>
          <div className="grid">
            {latest.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {sale.length > 0 && (
        <section className="wrap sec">
          <div className="sec-head">
            <h2>Promoções</h2>
            <Link href="/categoria/promocoes">Ver tudo</Link>
          </div>
          <div className="grid">
            {sale.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      <section className="steps-band">
        <div className="wrap steps">
          <div>
            <b>1. Escolha</b>
            <span>Navegue pelos pijamas e coloque na sacola o tamanho e a cor que quiser.</span>
          </div>
          <div>
            <b>2. Finalize</b>
            <span>Ao finalizar, você abre o WhatsApp com o link de cada peça escolhida.</span>
          </div>
          <div>
            <b>3. Combine</b>
            <span>Pagamento e entrega são combinados direto com a gente na conversa.</span>
          </div>
        </div>
      </section>
    </>
  );
}
