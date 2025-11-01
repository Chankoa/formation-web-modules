import { useEffect, useState } from "react";

const STORAGE_KEY = "formation-theme";
const COLOR_SCHEME_KEY = "formation-color-scheme";

export const COLOR_SCHEMES = [
  {
    id: "default",
    label: "Classique",
    preview: ["#e03a58", "#343434"],
  },
  {
    id: "teal-amber",
    label: "Teal & Amber",
    preview: ["#00897B", "#FFC107"],
  },
];

const DEFAULT_COLOR_SCHEME = COLOR_SCHEMES[0].id;

const isValidColorScheme = (value) =>
  COLOR_SCHEMES.some((scheme) => scheme.id === value);

const getSystemPreference = () => {
  if (window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  return getSystemPreference();
};

const getInitialColorScheme = () => {
  if (typeof window === "undefined") {
    return DEFAULT_COLOR_SCHEME;
  }
  const stored = window.localStorage.getItem(COLOR_SCHEME_KEY);
  if (stored && isValidColorScheme(stored)) {
    return stored;
  }
  return DEFAULT_COLOR_SCHEME;
};

const applyThemeAttributes = (theme, colorScheme) => {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-color-scheme", colorScheme);
};

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [colorScheme, setColorScheme] = useState(getInitialColorScheme);

  useEffect(() => {
    applyThemeAttributes(theme, colorScheme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    window.localStorage.setItem(COLOR_SCHEME_KEY, colorScheme);
  }, [theme, colorScheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event) => {
      const systemTheme = event.matches ? "dark" : "light";
      setTheme((current) => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "dark" || stored === "light") {
          return current;
        }
        return systemTheme;
      });
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleColorSchemeChange = (nextScheme) => {
    setColorScheme((current) => {
      if (!nextScheme) {
        return current ?? DEFAULT_COLOR_SCHEME;
      }
      const resolved = isValidColorScheme(nextScheme)
        ? nextScheme
        : DEFAULT_COLOR_SCHEME;
      return resolved === current ? current : resolved;
    });
  };

  return {
    theme,
    toggleTheme,
    colorScheme,
    setColorScheme: handleColorSchemeChange,
  };
}
