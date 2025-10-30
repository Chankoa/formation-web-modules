export default function Footer() {
  return (
    <footer className="site-footer">
      <p>Formation Création Web — Modules, cours et chapitres</p>
      <p className="site-footer__meta">
        © {new Date().getFullYear()} — Chandra Pedagogy. Design system inspiré
        par VS Code, adapté en React & Sass.
      </p>
    </footer>
  );
}
