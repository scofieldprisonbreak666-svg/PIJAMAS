# Pijamas Sotana

Loja online de pijamas femininos. Next.js + Supabase (banco, fotos e login do admin) + Vercel.
O cliente monta a sacola e, ao finalizar, abre o WhatsApp (17 99201-8965) com o link de cada peça.

## 1. Supabase (uma vez só)

1. Crie um projeto em supabase.com.
2. **SQL Editor > New query**: cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
   Isso cria as tabelas, as permissões, o bucket de fotos `produtos` e 4 categorias iniciais.
3. **Authentication > Users > Add user**: crie o e-mail e a senha que a dona da loja vai usar no painel
   (marque "Auto Confirm User").
4. **Authentication > Sign In / Providers > Email**: desligue **"Allow new users to sign up"**,
   para que ninguém além de você consiga criar conta.
5. **Project Settings > API**: copie a **Project URL** e a chave **anon public**.

## 2. Rodar no VSCode

```bash
npm install
cp .env.example .env.local     # no Windows: copy .env.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

- Loja: http://localhost:3000
- Painel: http://localhost:3000/admin

## 3. Publicar na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Na Vercel: **Add New > Project**, importe o repositório.
3. Em **Environment Variables**, cadastre as 4 variáveis do `.env.example`
   (em `NEXT_PUBLIC_SITE_URL` coloque o endereço final, ex: `https://pijamassotana.com.br`).
4. **Deploy**. Depois, em Settings > Domains, ligue o domínio da loja.

> Importante: `NEXT_PUBLIC_SITE_URL` deve ser o endereço real do site, é ele que aparece
> nos links de produto enviados no WhatsApp e na pré-visualização com a foto.

## Como usar o painel (`/admin`)

- **Novo produto**: envie as fotos direto do celular (são reduzidas automaticamente), preencha nome,
  categoria, preço, tamanhos e cores, e toque em **Salvar produto**. A primeira foto é a capa.
- **Visível / Destaque**: os botões na lista escondem o produto ou o colocam na página inicial.
- **Categorias**: crie, renomeie, mude a ordem e exclua. Também dá para criar uma categoria nova
  direto na tela do produto ("+ Criar nova categoria..."). Elas aparecem sozinhas no menu do site.
- Alterações aparecem na loja em até ~30 segundos.

## Onde mexer

- Nome, telefone e tamanhos padrão: `lib/config.js`
- Cores e fontes: topo de `app/globals.css` (variáveis `--plum`, `--soft`...) e `app/layout.js`
- Texto da mensagem enviada ao WhatsApp: `lib/whatsapp.js`
