import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { COLOR_SCHEMES, useTheme } from "../hooks/useTheme";
import defaultLogo from "../assets/learnit-logo.svg";

const anchorLinks = [
  { id: "intro", label: "Introduction" },
  { id: "modules", label: "Modules" },
  { id: "supports", label: "Supports" },
  { id: "contact", label: "Contact" },
];

const DESKTOP_MEDIA_QUERY = "(min-width: 992px)";

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3v1.5" />
      <path d="M12 19.5V21" />
      <path d="M4.5 12H3" />
      <path d="M21 12h-1.5" />
      <path d="M18.364 5.636l-1.06 1.06" />
      <path d="M6.697 17.303l-1.06 1.06" />
      <path d="M5.636 5.636l1.06 1.06" />
      <path d="M17.303 17.303l1.06 1.06" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function Header({
  logoSrc,
  logoAlt = "LEARNIT",
  title,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
  });
  const { theme, toggleTheme, colorScheme, setColorScheme } = useTheme();
  const location = useLocation();
  const navRef = useRef(null);

  const isHomePage = location.pathname === "/";
  const sharedRoutes = [
    { id: "dashboard", label: "Dashboard", to: "/dashboard", type: "route" },
    { id: "content-manager", label: "Gestion contenu", to: "/admin/contenu", type: "route" },
  ];

  const navItems = isHomePage
    ? [
        ...anchorLinks.map((link) => ({
          id: link.id,
          label: link.label,
          href: `#${link.id}`,
          type: "anchor",
        })),
        ...sharedRoutes,
      ]
    : [
        { id: "home", label: "Accueil", to: "/", type: "route" },
        ...sharedRoutes,
      ];

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const handleChange = (event) => {
      setIsDesktop(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDesktop) {
      setMenuOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.setProperty("overflow", "hidden");
    } else {
      document.body.style.removeProperty("overflow");
    }

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) {
      return;
    }

    const focusable = navElement.querySelectorAll("a, button");
    focusable.forEach((element) => {
      if (!isDesktop && !menuOpen) {
        element.setAttribute("tabindex", "-1");
      } else {
        element.removeAttribute("tabindex");
      }
    });
  }, [menuOpen, isDesktop]);

  const navId = "primary-navigation";
  const navAriaHidden = !isDesktop && !menuOpen ? "true" : undefined;
  const navClassName = ["site-nav", menuOpen ? "is-open" : null]
    .filter(Boolean)
    .join(" ");

  const closeMenu = () => setMenuOpen(false);
  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const ThemeToggleButton = ({ className = "", autoClose = false }) => (
    <button
      className={['theme-toggle', className].filter(Boolean).join(' ')}
      type="button"
      onClick={() => {
        toggleTheme();
        if (autoClose && !isDesktop) {
          closeMenu();
        }
      }}
      aria-label={
        theme === "dark"
          ? "Activer le mode clair"
          : "Activer le mode sombre"
      }
      aria-pressed={theme === "dark"}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </span>
      <span className="sr-only">
        {theme === "dark"
          ? "Activer le mode clair"
          : "Activer le mode sombre"}
      </span>
    </button>
  );

  const ColorSchemeSwitch = ({ autoClose = false }) => (
    <div className="color-scheme-switch" aria-label="Sélection de palette">
      <span className="color-scheme-switch__label">Palette</span>
      <div className="color-scheme-switch__options" role="radiogroup" aria-label="Sélection de palette de couleurs">
        {COLOR_SCHEMES.map((scheme) => {
          const optionClassName = [
            "color-scheme-switch__option",
            `color-scheme-switch__option--${scheme.id}`,
          ]
            .filter(Boolean)
            .join(" ");

          const [startColor, endColor] = Array.isArray(scheme.preview)
            ? [scheme.preview[0], scheme.preview[1] ?? scheme.preview[0]]
            : [undefined, undefined];
          const swatchStyle = startColor
            ? {
                background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
              }
            : undefined;

          return (
            <button
              key={scheme.id}
              type="button"
              role="radio"
              aria-checked={colorScheme === scheme.id}
              className={optionClassName}
              title={`Palette ${scheme.label}`}
              onClick={() => {
                setColorScheme(scheme.id);
                if (autoClose && !isDesktop) {
                  closeMenu();
                }
              }}
            >
              <span
                className="color-scheme-switch__swatch"
                aria-hidden="true"
                style={swatchStyle}
              />
              <span className="color-scheme-switch__text">{scheme.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const titleContent =
    title ?? (
      <>
  <span className="logo__text-primary is-bold">LEARN</span>
  <span className="logo__text-secondary">IT</span>
      </>
    );

  const resolvedLogo = logoSrc ?? defaultLogo;

  return (
    <header className="site-header" id="top">
      <div className="container site-header__inner">
        <div className="brand">
          <Link
            to="/"
            className="logo"
            aria-label="Retour à l'accueil"
            onClick={closeMenu}
          >
            {resolvedLogo ? (
              <img src={resolvedLogo} alt={logoAlt} className="logo__image" />
            ) : null}
            <span className="logo__text">{titleContent}</span>
          </Link>
        </div>

        <div className="site-header__actions">
          <ThemeToggleButton className="theme-toggle--inline" />
          <nav
            ref={navRef}
            className={navClassName}
            id={navId}
            aria-label="Navigation principale"
            aria-hidden={navAriaHidden}
          >
            <div className="site-nav__content">
              <div className="site-nav__top">
                <span className="site-nav__title">Navigation</span>
                <button
                  type="button"
                  className="site-nav__close"
                  onClick={closeMenu}
                  aria-label="Fermer le menu"
                >
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Fermer le menu</span>
                </button>
              </div>
              <ul className="site-nav__list">
                {navItems.map((item) => {
                  if (item.type === "anchor") {
                    return (
                      <li key={item.id}>
                        <a className="site-nav__link" href={item.href} onClick={closeMenu}>
                          {item.label}
                        </a>
                      </li>
                    );
                  }

                  const isActive = location.pathname === item.to;
                  return (
                    <li key={item.id}>
                      <Link
                        className={`site-nav__link${isActive ? " is-active" : ""}`}
                        to={item.to}
                        onClick={closeMenu}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="site-nav__footer">
                <ColorSchemeSwitch autoClose />
                <ThemeToggleButton
                  className="theme-toggle--nav"
                  autoClose
                />
              </div>
            </div>
          </nav>

          <button
            className={`menu-toggle${menuOpen ? " is-open" : ""}`}
            type="button"
            aria-expanded={menuOpen}
            aria-controls={navId}
            aria-label={
              menuOpen
                ? "Fermer le menu de navigation"
                : "Ouvrir le menu de navigation"
            }
            onClick={handleMenuToggle}
          >
            <span className="menu-toggle__line" />
            <span className="menu-toggle__line" />
            <span className="menu-toggle__line" />
          </button>
        </div>
      </div>
      <div
        className={`site-nav__overlay${menuOpen ? " is-visible" : ""}`}
        aria-hidden="true"
        onClick={closeMenu}
      />
    </header>
  );
}
