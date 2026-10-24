'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SIZE_PRESETS } from '@/lib/config';
import { slugify, toNumber } from '@/lib/format';

const pathOf = (url) => url.split('/object/public/produtos/')[1] || '';

// reduz a foto (celular manda 5-10 MB) antes de enviar
async function compress(file, max = 1400, quality = 0.85) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Falha ao processar a foto'))), 'image/jpeg', quality));
}

export default function ProductForm({ product, categories, reloadCategories, onClose, onSaved }) {
  const original = product?.images || [];
  const [f, setF] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price ?? '',
    promo_price: product?.promo_price ?? '',
    category_id: product?.category_id || '',
    images: original,
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    featured: product?.featured || false,
    active: product?.active ?? true,
  });
  const [removed, setRemoved] = useState([]);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  async function onFiles(e) {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    setErr('');
    setUploading((n) => n + files.length);
    for (const file of files) {
      try {
        const blob = await compress(file);
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await supabase.storage.from('produtos').upload(name, blob, {
          contentType: 'image/jpeg',
          cacheControl: '31536000',
        });
        if (error) throw error;
        const { data } = supabase.storage.from('produtos').getPublicUrl(name);
        setF((s) => ({ ...s, images: [...s.images, data.publicUrl] }));
      } catch (ex) {
        setErr('Não foi possível enviar uma das fotos: ' + (ex.message || ex));
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function removeImg(url) {
    set('images', f.images.filter((u) => u !== url));
    setRemoved((r) => [...r, url]);
  }

  function makeCover(url) {
    set('images', [url, ...f.images.filter((u) => u !== url)]);
  }

  function toggleSize(s) {
    set('sizes', f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s]);
  }

  function addSize() {
    const v = sizeInput.trim();
    if (v && !f.sizes.includes(v)) set('sizes', [...f.sizes, v]);
    setSizeInput('');
  }

  function addColor() {
    const parts = colorInput.split(',').map((c) => c.trim()).filter(Boolean);
    const next = [...f.colors];
    parts.forEach((c) => !next.includes(c) && next.push(c));
    set('colors', next);
    setColorInput('');
  }

  async function onCategoryChange(e) {
    const v = e.target.value;
    if (v !== '__new__') return set('category_id', v);
    const name = prompt('Nome da nova categoria:');
    if (!name || !name.trim()) return;
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name.trim(), slug: slugify(name), position: categories.length + 1 })
      .select()
      .single();
    if (error) return setErr('Não foi possível criar a categoria: ' + error.message);
    await reloadCategories();
    set('category_id', data.id);
  }

  async function close() {
    // apaga fotos enviadas nesta sessão que não foram salvas
    const orphans = f.images.filter((u) => !original.includes(u)).concat(removed.filter((u) => !original.includes(u)));
    const paths = [...new Set(orphans)].map(pathOf).filter(Boolean);
    if (paths.length) supabase.storage.from('produtos').remove(paths);
    onClose();
  }

  async function save() {
    setErr('');
    if (uploading) return setErr('Aguarde o envio das fotos terminar.');
    if (!f.name.trim()) return setErr('Informe o nome do produto.');
    const price = toNumber(f.price);
    if (!(price > 0)) return setErr('Informe o preço.');
    const promo = String(f.promo_price).trim() === '' ? null : toNumber(f.promo_price);
    if (promo !== null && !(promo > 0 && promo < price)) return setErr('O preço promocional precisa ser menor que o preço normal.');
    if (!f.images.length) return setErr('Envie pelo menos uma foto.');

    setSaving(true);
    const row = {
      name: f.name.trim(),
      slug: slugify(f.name),
      description: f.description.trim() || null,
      price,
      promo_price: promo,
      category_id: f.category_id ? Number(f.category_id) : null,
      images: f.images,
      sizes: f.sizes,
      colors: f.colors,
      featured: f.featured,
      active: f.active,
    };
    const { error } = product
      ? await supabase.from('products').update(row).eq('id', product.id)
      : await supabase.from('products').insert(row);
    if (error) {
      setSaving(false);
      return setErr('Erro ao salvar: ' + error.message);
    }
    const toDelete = removed.filter((u) => !f.images.includes(u)).map(pathOf).filter(Boolean);
    if (toDelete.length) await supabase.storage.from('produtos').remove(toDelete);
    onSaved();
  }

  return (
    <div className="adm-modal">
      <div className="adm-sheet">
        <header className="adm-sheet-head">
          <h2>{product ? 'Editar produto' : 'Novo produto'}</h2>
          <button className="adm-link" onClick={close}>Cancelar</button>
        </header>

        <div className="adm-sheet-body">
          <div className="field">
            <span className="label">Fotos <small>(a primeira é a capa)</small></span>
            <div className="photos">
              {f.images.map((url, i) => (
                <div key={url} className="photo">
                  <img src={url} alt="" />
                  {i === 0 ? <span className="cover">Capa</span> : (
                    <button type="button" className="mk" onClick={() => makeCover(url)}>Tornar capa</button>
                  )}
                  <button type="button" className="rm" aria-label="Remover foto" onClick={() => removeImg(url)}>✕</button>
                </div>
              ))}
              {Array.from({ length: uploading }).map((_, i) => (
                <div key={`up${i}`} className="photo loading"><span>Enviando...</span></div>
              ))}
              <label className="photo add">
                <input type="file" accept="image/*" multiple onChange={onFiles} hidden />
                <span>+<br />Adicionar fotos</span>
              </label>
            </div>
          </div>

          <label className="field">
            <span className="label">Nome do produto</span>
            <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Pijama Curto Cetim Rosé" />
          </label>

          <label className="field">
            <span className="label">Categoria</span>
            <select value={f.category_id} onChange={onCategoryChange}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="__new__">+ Criar nova categoria...</option>
            </select>
          </label>

          <div className="two">
            <label className="field">
              <span className="label">Preço (R$)</span>
              <input inputMode="decimal" value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="129,90" />
            </label>
            <label className="field">
              <span className="label">Preço promocional <small>(opcional)</small></span>
              <input inputMode="decimal" value={f.promo_price} onChange={(e) => set('promo_price', e.target.value)} placeholder="99,90" />
            </label>
          </div>

          <div className="field">
            <span className="label">Tamanhos disponíveis</span>
            <div className="adm-chips wrap">
              {[...new Set([...SIZE_PRESETS, ...f.sizes])].map((s) => (
                <button key={s} type="button" className={`chip ${f.sizes.includes(s) ? 'on' : ''}`} onClick={() => toggleSize(s)}>{s}</button>
              ))}
            </div>
            <div className="inline-add">
              <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())} placeholder="Outro tamanho (ex: 38)" />
              <button type="button" className="adm-btn small" onClick={addSize}>Adicionar</button>
            </div>
          </div>

          <div className="field">
            <span className="label">Cores disponíveis</span>
            <div className="adm-chips wrap">
              {f.colors.map((c) => (
                <button key={c} type="button" className="chip on" onClick={() => set('colors', f.colors.filter((x) => x !== c))}>{c} ✕</button>
              ))}
            </div>
            <div className="inline-add">
              <input value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())} placeholder="Ex: Rosé, Azul bebê" />
              <button type="button" className="adm-btn small" onClick={addColor}>Adicionar</button>
            </div>
          </div>

          <label className="field">
            <span className="label">Descrição <small>(tecido, medidas, cuidados...)</small></span>
            <textarea rows={5} value={f.description} onChange={(e) => set('description', e.target.value)} />
          </label>

          <div className="switches">
            <label><input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} /> Visível no site</label>
            <label><input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} /> Destaque na página inicial</label>
          </div>

          {err && <p className="adm-err">{err}</p>}
        </div>

        <footer className="adm-sheet-foot">
          <button className="adm-btn primary big" onClick={save} disabled={saving || uploading > 0}>
            {saving ? 'Salvando...' : uploading ? 'Enviando fotos...' : 'Salvar produto'}
          </button>
        </footer>
      </div>
    </div>
  );
}
