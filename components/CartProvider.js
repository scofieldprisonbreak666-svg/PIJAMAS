'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

const KEY = 'sotana_cart_v1';
const keyOf = (i) => `${i.id}|${i.size || ''}|${i.color || ''}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      const s = localStorage.getItem(KEY);
      if (s) setItems(JSON.parse(s));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const value = useMemo(
    () => ({
      items,
      open,
      origin,
      setOpen,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.price * i.qty, 0),
      add(item) {
        setItems((prev) => {
          const k = keyOf(item);
          const found = prev.find((i) => keyOf(i) === k);
          if (found) return prev.map((i) => (keyOf(i) === k ? { ...i, qty: i.qty + (item.qty || 1) } : i));
          return [...prev, { ...item, qty: item.qty || 1 }];
        });
        setOpen(true);
      },
      setQty(k, qty) {
        setItems((prev) =>
          qty <= 0 ? prev.filter((i) => keyOf(i) !== k) : prev.map((i) => (keyOf(i) === k ? { ...i, qty } : i))
        );
      },
      remove(k) {
        setItems((prev) => prev.filter((i) => keyOf(i) !== k));
      },
      clear() {
        setItems([]);
      },
      keyOf,
    }),
    [items, open, origin]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
