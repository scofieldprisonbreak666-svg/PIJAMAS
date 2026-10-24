import Link from 'next/link';
import { brl, discountPct, finalPrice, onSale, productPath } from '@/lib/format';

export default function ProductCard({ p }) {
  const [img, img2] = p.images || [];
  const pct = discountPct(p);
  return (
    <Link href={productPath(p)} className="card">
      <div className="card-img">
        {img ? <img src={img} alt={p.name} loading="lazy" /> : <span className="ph" />}
        {img2 && <img className="alt" src={img2} alt="" loading="lazy" />}
        {pct > 0 && <span className="tag">-{pct}%</span>}
      </div>
      <h3>{p.name}</h3>
      <p className="price">
        {onSale(p) && <s>{brl(p.price)}</s>}
        <b>{brl(finalPrice(p))}</b>
      </p>
    </Link>
  );
}
