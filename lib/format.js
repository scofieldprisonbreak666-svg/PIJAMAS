export const brl = (n) =>
  Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const slugify = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const productPath = (p) => `/produto/${p.id}-${p.slug || slugify(p.name)}`;

export const parseId = (s) => parseInt(String(s).split('-')[0], 10);

export const onSale = (p) => p.promo_price != null && Number(p.promo_price) < Number(p.price);

export const finalPrice = (p) => (onSale(p) ? Number(p.promo_price) : Number(p.price));

export const discountPct = (p) =>
  onSale(p) ? Math.round((1 - Number(p.promo_price) / Number(p.price)) * 100) : 0;

// aceita "129,90", "1.290,00" e "129.90"
export const toNumber = (v) => {
  const s = String(v).trim();
  if (!s) return NaN;
  return s.includes(',') ? parseFloat(s.replace(/\./g, '').replace(',', '.')) : parseFloat(s);
};
