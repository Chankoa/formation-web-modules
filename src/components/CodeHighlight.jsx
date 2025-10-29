import { useEffect, useMemo, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-php";

const LANGUAGE_ALIASES = {
  html: "markup",
  xml: "markup",
  svg: "markup",
  js: "javascript",
  jsx: "jsx",
  json: "json",
  css: "css",
  scss: "scss",
  sass: "scss",
  php: "php",
};

function normaliseLanguage(language) {
  if (!language) {
    return "markup";
  }
  const key = String(language).trim().toLowerCase();
  return LANGUAGE_ALIASES[key] ?? key;
}

export default function CodeHighlight({
  label,
  language = "markup",
  source = "",
  tagClass,
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef();

  const normalisedLanguage = useMemo(
    () => normaliseLanguage(language),
    [language],
  );

  const highlighted = useMemo(() => {
    const grammar = Prism.languages[normalisedLanguage] ?? Prism.languages.markup;
    return Prism.highlight(source, grammar, normalisedLanguage);
  }, [normalisedLanguage, source]);

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const displayLabel = label ?? normalisedLanguage.toUpperCase();

  return (
    <div className="codeblock">
      <div className={`codeblock__tag ${tagClass ?? "tag--default"}`}>
        {displayLabel}
      </div>
      <button
        type="button"
        className={`codeblock__copy${copied ? " codeblock__copy--success" : ""}`}
        onClick={handleCopy}
        aria-label={`Copier le bloc ${displayLabel}`}
      >
        {copied ? "Copié !" : "Copier"}
      </button>
      <pre className="code">
        <code
          className={`language-${normalisedLanguage}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
