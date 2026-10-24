import { supabase } from './supabase';

export async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('position', { ascending: true })
    .order('name', { ascending: true });
  return data || [];
}

export async function getProducts({ categoryId, featured, onSale, limit } = {}) {
  let q = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (categoryId) q = q.eq('category_id', categoryId);
  if (featured) q = q.eq('featured', true);
  if (onSale) q = q.not('promo_price', 'is', null);
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return data || [];
}

export async function getProduct(id) {
  if (!id) return null;
  const { data } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .eq('active', true)
    .maybeSingle();
  return data;
}
