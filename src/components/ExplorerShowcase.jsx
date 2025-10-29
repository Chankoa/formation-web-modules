import CodeHighlight from "./CodeHighlight";

const explorerStructure = `📁 formation-modulaire/
├─ 📄 index.html
├─ 📁 src/
│  ├─ 📁 components/
│  ├─ 📁 data/
│  └─ 📄 main.jsx
├─ 📁 styles/
└─ 📄 package.json`;

const htmlSample = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Formation Création Web</title>
  </head>
  <body>
    <header>
      <h1>Bienvenue</h1>
    </header>
  </body>
</html>`;

const cssSample = `:root {
  --brand: #2a324b;
}
body {
  background: var(--color-bg-main);
  color: var(--color-primary);
  font-family: system-ui, -apple-system, "Segoe UI", "Roboto", sans-serif;
}
header {
  border-bottom: 1px solid var(--color-border);
}`;

const jsSample = `export function saluer(nom = "tout le monde") {
  console.log(\`Bonjour \${nom} !\`);
}

saluer();`;

const codeSamples = [
  {
    id: "html",
    label: "HTML",
    language: "html",
    tagClass: "tag--html",
    source: htmlSample,
  },
  {
    id: "scss",
    label: "SCSS",
    language: "scss",
    tagClass: "tag--css",
    source: cssSample,
  },
  {
    id: "react",
    label: "React",
    language: "jsx",
    tagClass: "tag--js",
    source: jsSample,
  },
];

export default function ExplorerShowcase() {
  return (
    <section className="window-stack" id="supports">
      <div className="window" aria-label="Explorateur de fichiers">
        <div className="window__bar">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
          <span className="win-title">Explorateur de composants</span>
        </div>
        <pre className="explorer">{explorerStructure}</pre>
      </div>

      <div className="code-window" aria-label="Extraits de code">
        <div className="window__bar">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
          <span className="win-title">Éditeur de code</span>
        </div>

        <div className="code-columns">
          {codeSamples.map((sample) => (
            <CodeHighlight key={sample.id} {...sample} />
          ))}
        </div>
      </div>
    </section>
  );
}
