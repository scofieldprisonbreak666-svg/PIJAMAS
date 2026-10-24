'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { brl } from '@/lib/format';
import { orderMessage, waUrl } from '@/lib/whatsapp';

export default function CartDrawer() {
  const { items, open, setOpen, total, setQty, remove, clear, keyOf, origin } = useCart();
  if (!open) return null;

  const href = items.length ? waUrl(orderMessage(items, origin)) : '#';

  return (
    <div className="overlay right" onClick={() => setOpen(false)}>
      <aside className="cart" onClick={(e) => e.stopPropagation()} aria-label="Sacola">
        <div className="panel-head">
          <h2>Sua sacola</h2>
          <button className="icon-btn" aria-label="Fechar sacola" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Sua sacola está vazia.</p>
            <Link href="/categoria/todos" className="btn" onClick={() => setOpen(false)}>
              Ver pijamas
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((i) => {
                const k = keyOf(i);
                return (
                  <li key={k}>
                    <Link href={i.path} onClick={() => setOpen(false)} className="cart-img">
                      {i.image ? <img src={i.image} alt={i.name} /> : <span className="ph" />}
                    </Link>
                    <div className="cart-info">
                      <Link href={i.path} onClick={() => setOpen(false)}>
                        {i.name}
                      </Link>
                      <small>{[i.size && `Tam ${i.size}`, i.color].filter(Boolean).join(' · ')}</small>
                      <div className="cart-row">
                        <div className="qty">
                          <button aria-label="Diminuir" onClick={() => setQty(k, i.qty - 1)}>−</button>
                          <span>{i.qty}</span>
                          <button aria-label="Aumentar" onClick={() => setQty(k, i.qty + 1)}>+</button>
                        </div>
                        <b>{brl(i.price * i.qty)}</b>
                      </div>
                      <button className="link-btn" onClick={() => remove(k)}>
                        Remover
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="cart-foot">
              <div className="cart-total">
                <span>Total</span>
                <b>{brl(total)}</b>
              </div>
              <a className="btn btn-wa" href={href} target="_blank" rel="noopener noreferrer">
                Finalizar pelo WhatsApp
              </a>
              <p className="hint">Pagamento e entrega são combinados com a gente na conversa.</p>
              <button className="link-btn" onClick={clear}>
                Esvaziar sacola
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
