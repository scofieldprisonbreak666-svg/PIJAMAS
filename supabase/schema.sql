-- Rode este arquivo inteiro em: Supabase > SQL Editor > New query > Run

create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null,
  description text,
  price numeric(10,2) not null,
  promo_price numeric(10,2),
  category_id bigint references categories(id) on delete set null,
  images text[] not null default '{}',
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on products(category_id);
create index if not exists products_created_idx on products(created_at desc);

alter table categories enable row level security;
alter table products enable row level security;

drop policy if exists "ler categorias" on categories;
drop policy if exists "admin categorias" on categories;
drop policy if exists "ler produtos" on products;
drop policy if exists "admin produtos" on products;

create policy "ler categorias" on categories for select using (true);
create policy "admin categorias" on categories for all to authenticated using (true) with check (true);
create policy "ler produtos" on products for select using (active = true);
create policy "admin produtos" on products for all to authenticated using (true) with check (true);

-- Bucket de fotos (publico para leitura)
insert into storage.buckets (id, name, public) values ('produtos', 'produtos', true)
on conflict (id) do nothing;

drop policy if exists "ver fotos" on storage.objects;
drop policy if exists "enviar fotos" on storage.objects;
drop policy if exists "editar fotos" on storage.objects;
drop policy if exists "apagar fotos" on storage.objects;

create policy "ver fotos" on storage.objects for select using (bucket_id = 'produtos');
create policy "enviar fotos" on storage.objects for insert to authenticated with check (bucket_id = 'produtos');
create policy "editar fotos" on storage.objects for update to authenticated using (bucket_id = 'produtos');
create policy "apagar fotos" on storage.objects for delete to authenticated using (bucket_id = 'produtos');

-- Categorias iniciais (voce pode editar/criar outras no painel)
insert into categories (name, slug, position) values
  ('Pijama Curto', 'pijama-curto', 1),
  ('Pijama Longo', 'pijama-longo', 2),
  ('Camisola', 'camisola', 3),
  ('Short Doll', 'short-doll', 4)
on conflict (slug) do nothing;
