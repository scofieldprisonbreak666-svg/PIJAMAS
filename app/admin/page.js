'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { brl, finalPrice } from '@/lib/format';
import { STORE } from '@/lib/config';
import ProductForm from './ProductForm';
import Categories from './Categories';

const pathOf = (url) => url.split('/object/public/produtos/')[1] || '';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr('E-mail ou senha incorretos.');
    setBusy(false);
  }

  return (
    <div className="adm-login">
      <form onSubmit={submit} className="adm-card">
        <h1>{STORE.name}</h1>
        <p className="adm-muted">Entre para gerenciar a loja.</p>
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {err && <p className="adm-err">{err}</p>}
        <button className="adm-btn primary" disabled={busy}>
          {busy ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ session }) {
  const [tab, setTab] = useState('produtos');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [toast, setToast] = useState('');

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('position').order('name');
    setCategories(data || []);
    return data || [];
  }, []);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadCategories(), loadProducts()]);
      setLoading(false);
    })();
  }, [loadCategories, loadProducts]);

  async function toggle(p, field) {
    const { error } = await supabase.from('products').update({ [field]: !p[field] }).eq('id', p.id);
    if (error) return notify('Erro: ' + error.message);
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, [field]: !p[field] } : x)));
  }

  async function remove(p) {
    if (!confirm(`Excluir "${p.name}"? Isso não pode ser desfeito.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) return notify('Erro: ' + error.message);
    const paths = (p.images || []).map(pathOf).filter(Boolean);
    if (paths.length) await supabase.storage.from('produtos').remove(paths);
    setProducts((list) => list.filter((x) => x.id !== p.id));
    notify('Produto excluído');
  }

  const catName = (id) => categories.find((c) => c.id === id)?.name || 'Sem categoria';

  return (
    <div className="adm-wrap">
      <header className="adm-top">
        <div>
          <strong>{STORE.name}</strong>
          <span className="adm-muted"> · Painel</span>
        </div>
        <div className="adm-top-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-link">Ver loja</a>
          <button className="adm-link" onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>
      </header>

      <div className="adm-tabs">
        <button className={tab === 'produtos' ? 'on' : ''} onClick={() => setTab('produtos')}>Produtos</button>
        <button className={tab === 'categorias' ? 'on' : ''} onClick={() => setTab('categorias')}>Categorias</button>
      </div>

      {tab === 'produtos' && (
        <section>
          <button className="adm-btn primary big" onClick={() => setEditing('new')}>
            + Novo produto
          </button>

          {loading ? (
            <p className="adm-muted pad">Carregando...</p>
          ) : products.length === 0 ? (
            <div className="adm-empty">
              <p>Nenhum produto ainda.</p>
              <p className="adm-muted">Toque em “Novo produto”, envie as fotos e preencha nome e preço.</p>
            </div>
          ) : (
            <ul className="adm-list">
              {products.map((p) => (
                <li key={p.id} className={p.active ? '' : 'off'}>
                  <button className="adm-thumb" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`}>
                    {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <span />}
                  </button>
                  <div className="adm-info">
                    <button className="adm-name" onClick={() => setEditing(p)}>{p.name}</button>
                    <span className="adm-muted">{catName(p.category_id)} · {brl(finalPrice(p))}</span>
                    <div className="adm-chips">
                      <button className={`chip ${p.active ? 'on' : ''}`} onClick={() => toggle(p, 'active')}>
                        {p.active ? 'Visível' : 'Oculto'}
                      </button>
                      <button className={`chip ${p.featured ? 'on' : ''}`} onClick={() => toggle(p, 'featured')}>
                        {p.featured ? '★ Destaque' : '☆ Destaque'}
                      </button>
                    </div>
                  </div>
                  <div className="adm-side">
                    <button className="adm-btn small" onClick={() => setEditing(p)}>Editar</button>
                    <button className="adm-link danger" onClick={() => remove(p)}>Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'categorias' && (
        <Categories categories={categories} reload={loadCategories} notify={notify} />
      )}

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          categories={categories}
          reloadCategories={loadCategories}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await loadProducts();
            notify('Produto salvo');
          }}
        />
      )}

      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <p className="adm-muted pad center">Carregando...</p>;
  if (!session) return <Login />;
  return <Dashboard session={session} />;
}
