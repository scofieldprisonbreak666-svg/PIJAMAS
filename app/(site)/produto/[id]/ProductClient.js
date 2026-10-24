'use client';
import { useRef, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { brl, discountPct, finalPrice, onSale } from '@/lib/format';
import { orderMessage, waUrl } from '@/lib/whatsapp';

export default function ProductClient({ product: p, path }) {
  const { add, origin } = useCart();
  const [size, setSize] = useState(p.sizes?.length === 1 ? p.sizes[0] : '');
  const [color, setColor] = useState(p.colors?.length === 1 ? p.colors[0] : '');
  const [error, setError] = useState('');
  const [idx, setIdx] = useState(0);
  const scroller = useRef(null);

  const images = p.images || [];
  const price = finalPrice(p);
  const pct = discountPct(p);

  function item() {
    if (p.sizes?.length && !size) {
      setError('Escolha o tamanho.');
      return null;
    }
    if (p.colors?.length && !color) {
      setError('Escolha a cor.');
      return null;
    }
    setError('');
    return { id: p.id, name: p.name, price, image: images[0], size, color, path, qty: 1 };
  }

  function addToCart() {
    const i = item();
    if (i) add(i);
  }

  function buyNow(e) {
    const i = item();
    if (!i) {
      e.preventDefault();
      return;
    }
    e.currentTarget.href = waUrl(orderMessage([i], origin || window.location.origin));
  }

  function onScroll(e) {
    const el = e.currentTarget;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i) {
    setIdx(i);
    const el = scroller.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
  }

  return (
    <div className="pdp">
      <div className="gallery">
        <div className="gal-main" ref={scroller} onScroll={onScroll}>
          {images.length ? (
            images.map((src, i) => <img key={src} src={src} alt={`${p.name} - foto ${i + 1}`} loading={i ? 'lazy' : 'eager'} />)
          ) : (
            <span className="ph" />
          )}
        </div>
        {images.length > 1 && (
          <div className="thumbs">
            {images.map((src, i) => (
              <button key={src} className={i === idx ? 'on' : ''} onClick={() => goTo(i)} aria-label={`Ver foto ${i + 1}`}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdp-info">
        <h1>{p.name}</h1>
        <p className="price big">
          {onSale(p) && <s>{brl(p.price)}</s>}
          <b>{brl(price)}</b>
          {pct > 0 && <span className="tag inline">-{pct}%</span>}
        </p>

        {p.sizes?.length > 0 && (
          <div className="opt">
            <span className="opt-label">Tamanho{size ? `: ${size}` : ''}</span>
            <div className="opt-row">
              {p.sizes.map((s) => (
                <button key={s} className={`pill ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {p.colors?.length > 0 && (
          <div className="opt">
            <span className="opt-label">Cor{color ? `: ${color}` : ''}</span>
            <div className="opt-row">
              {p.colors.map((c) => (
                <button key={c} className={`pill ${color === c ? 'on' : ''}`} onClick={() => setColor(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="error" role="alert">{error}</p>}

        <div className="pdp-actions">
          <a className="btn btn-wa" href="#" onClick={buyNow} target="_blank" rel="noopener noreferrer">
            Comprar pelo WhatsApp
          </a>
          <button className="btn btn-outline" onClick={addToCart}>
            Adicionar à sacola
          </button>
        </div>

        {p.description && <div className="desc">{p.description}</div>}
      </div>
    </div>
  );
}
