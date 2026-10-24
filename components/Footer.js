import Link from 'next/link';
import { STORE } from '@/lib/config';
import { waUrl, helloMessage } from '@/lib/whatsapp';

export default function Footer({ categories = [] }) {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div>
          <p className="foot-logo">{STORE.name}</p>
          <p className="muted">{STORE.tagline}.</p>
        </div>
        <div>
          <h4>Pijamas</h4>
          <Link href="/categoria/todos">Todos os pijamas</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/categoria/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
        <div>
          <h4>Atendimento</h4>
          <a href={waUrl(helloMessage())} target="_blank" rel="noopener noreferrer">
            WhatsApp {STORE.whatsappLabel}
          </a>
          <p className="muted">Pedidos, pagamento e entrega são combinados pelo WhatsApp.</p>
        </div>
      </div>
      <div className="wrap copy">© {new Date().getFullYear()} {STORE.name}. Todos os direitos reservados.</div>
    </footer>
  );
}
