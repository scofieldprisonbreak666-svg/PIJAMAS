'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { STORE } from '@/lib/config';

export default function Header({ categories = [] }) {
  const [menu, setMenu] = useState(false);
  const { count, setOpen } = useCart();

  const links = [
    { href: '/categoria/todos', label: 'Todos os pijamas' },
    { href: '/categoria/novidades', label: 'Novidades' },
    ...categories.map((c) => ({ href: `/categoria/${c.slug}`, label: c.name })),
    { href: '/categoria/promocoes', label: 'Promoções' },
  ];

  return (
    <>
      <div className="announce">Escolha no site e finalize pelo WhatsApp</div>
      <header className="hdr">
        <div className="wrap hdr-row">
          <button className="icon-btn menu-btn" aria-label="Abrir menu" onClick={() => setMenu(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </button>
          <Link href="/" className="logo" onClick={() => setMenu(false)}>
            {STORE.name}
          </Link>
          <button className="icon-btn bag-btn" aria-label="Abrir sacola" onClick={() => setOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 8h14l-1 12H6L5 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {count > 0 && <span className="badge">{count}</span>}
          </button>
        </div>
        <nav className="nav" aria-label="Categorias">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      {menu && (
        <div className="overlay" onClick={() => setMenu(false)}>
          <aside className="menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <span className="logo-sm">{STORE.name}</span>
              <button className="icon-btn" aria-label="Fechar menu" onClick={() => setMenu(false)}>
                ✕
              </button>
            </div>
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenu(false)}>
                {l.label}
              </Link>
            ))}
          </aside>
        </div>
      )}
    </>
  );
}
