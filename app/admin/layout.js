import './admin.css';

export const metadata = {
  title: 'Painel | Pijamas Sotana',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="adm">{children}</div>;
}
