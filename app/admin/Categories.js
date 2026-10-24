'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/format';

export default function Categories({ categories, reload, notify }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function add(e) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    setBusy(true);
    const { error } = await supabase
      .from('categories')
      .insert({ name: n, slug: slugify(n), position: categories.length + 1 });
    setBusy(false);
    if (error) return notify(error.code === '23505' ? 'Já existe uma categoria com esse nome.' : 'Erro: ' + error.message);
    setName('');
    await reload();
    notify('Categoria criada');
  }

  async function rename(c) {
    const n = prompt('Novo nome da categoria:', c.name);
    if (!n || !n.trim() || n.trim() === c.name) return;
    const { error } = await supabase.from('categories').update({ name: n.trim(), slug: slugify(n) }).eq('id', c.id);
    if (error) return notify(error.code === '23505' ? 'Já existe uma categoria com esse nome.' : 'Erro: ' + error.message);
    await reload();
    notify('Categoria renomeada');
  }

  async function remove(c) {
    if (!confirm(`Excluir a categoria "${c.name}"? Os produtos dela ficarão sem categoria.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) return notify('Erro: ' + error.message);
    await reload();
    notify('Categoria excluída');
  }

  async function move(i, dir) {
    const a = categories[i];
    const b = categories[i + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from('categories').update({ position: i + dir + 1 }).eq('id', a.id),
      supabase.from('categories').update({ position: i + 1 }).eq('id', b.id),
    ]);
    await reload();
  }

  return (
    <section>
      <form onSubmit={add} className="adm-card row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da nova categoria" />
        <button className="adm-btn primary" disabled={busy}>Criar</button>
      </form>

      {categories.length === 0 ? (
        <div className="adm-empty"><p>Nenhuma categoria ainda.</p></div>
      ) : (
        <ul className="adm-list cats">
          {categories.map((c, i) => (
            <li key={c.id}>
              <div className="adm-info"><strong>{c.name}</strong></div>
              <div className="adm-side row">
                <button className="adm-btn small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
                <button className="adm-btn small" onClick={() => move(i, 1)} disabled={i === categories.length - 1} aria-label="Descer">↓</button>
                <button className="adm-btn small" onClick={() => rename(c)}>Renomear</button>
                <button className="adm-link danger" onClick={() => remove(c)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
