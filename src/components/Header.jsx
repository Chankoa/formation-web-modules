import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

const navLinks = [
  { id: "intro", label: "Introduction" },
  { id: "modules", label: "Modules" },
  { id: "supports", label: "Supports" },
  { id: "contact", label: "Contact" },
];

export default function Header({
  logoSrc,
  logoAlt = "Formation Création Web",
  title = "Formation Création Web",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const hasSectionLinks = isHomePage;

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const menuClass = hasSectionLinks
    ? menuOpen
      ? "menu menu--open"
      : "menu"
    : "menu menu--static";

  return (
    <header className="site-header" id="top">
      <div className="container site-header__inner">
        <div className="brand">
          <Link
            to="/"
            className="logo"
            aria-label="Retour à l'accueil"
            onClick={() => setMenuOpen(false)}
          >
            {logoSrc ? (
              <img src={logoSrc} alt={logoAlt} className="logo__image" />
            ) : null}
            <span className="logo__text">{title}</span>
          </Link>
          {hasSectionLinks ? (
            <button
              className={menuOpen ? "burger burger--open" : "burger"}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              aria-label="Ouvrir ou fermer le menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="burger__line" />
              <span className="burger__line" />
              <span className="burger__line" />
            </button>
          ) : null}
        </div>

        <nav className={menuClass} id="primary-navigation">
          {hasSectionLinks ? (
            <ul>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} onClick={handleLinkClick}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <Link
              to="/"
              className="menu__home-link"
              onClick={() => setMenuOpen(false)}
            >
              Retour à l'accueil
            </Link>
          )}
          <button
            className="btn btn-secondary theme-toggle"
            type="button"
            onClick={() => {
              toggleTheme();
              setMenuOpen(false);
            }}
          >
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </button>
        </nav>
      </div>
    </header>
  );
}
