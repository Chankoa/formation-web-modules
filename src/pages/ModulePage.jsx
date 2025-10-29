import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import CodeHighlight from "../components/CodeHighlight";
import modulesData from "../data/modules-formation-web.json";

const modules = modulesData.modules;

function getModuleById(id) {
  if (!id) {
    return undefined;
  }
  const normalisedId = id.trim().toUpperCase();
  return modules.find((item) => item.id.toUpperCase() === normalisedId);
}

export default function ModulePage() {
  const { moduleId } = useParams();
  const module = useMemo(() => getModuleById(moduleId), [moduleId]);

  const currentIndex = useMemo(() => {
    if (!module) {
      return -1;
    }
    return modules.findIndex((item) => item.id === module.id);
  }, [module]);

  const previousModule = currentIndex > 0 ? modules[currentIndex - 1] : undefined;
  const nextModule = currentIndex >= 0 && currentIndex < modules.length - 1 ? modules[currentIndex + 1] : undefined;

  if (!module) {
    return (
      <main className="module-page">
        <div className="module-hero module-hero--notfound">
          <div className="module-hero__inner container">
            <p className="module-hero__eyebrow">Module introuvable</p>
            <h1>Oups, cette page n’existe pas.</h1>
            <p className="module-hero__objective">
              Le module que vous cherchez n’est plus disponible ou l’identifiant est incorrect.
            </p>
            <Link className="btn" to="/">Retour à l’accueil</Link>
          </div>
        </div>
      </main>
    );
  }

  const {
    id,
    day,
    title,
    objectives,
    content,
    keyConcepts,
    activities,
    resources,
    deliverables,
    skills,
    duration,
    tags,
    codeExample,
  } = module;

  const codeLanguageLabel = codeExample?.lang
    ? codeExample.lang.toUpperCase()
    : undefined;

  const codeTagClass = (() => {
    if (!codeExample?.lang) {
      return undefined;
    }
    const language = codeExample.lang.toLowerCase();
    if (language === "html" || language === "markup") {
      return "tag--html";
    }
    if (language === "css" || language === "scss" || language === "sass") {
      return "tag--css";
    }
    if (language === "json") {
      return "tag--json";
    }
    if (language === "php") {
      return "tag--php";
    }
    if (language === "jsx" || language === "js" || language === "javascript") {
      return "tag--js";
    }
    return "tag--default";
  })();

  return (
    <main className="module-page">
      <header className="module-hero">
        <div className="module-hero__inner container">
          <Link className="module-hero__back" to="/#modules">
            ← Retour aux modules
          </Link>
          <div className="module-hero__meta">
            <span className="module-hero__day">{day}</span>
            <span className="module-hero__id">{id}</span>
          </div>
          <h1 className="module-hero__title">{title.fr}</h1>
          <p className="module-hero__objective">{objectives.fr}</p>
          <div className="module-hero__details">
            <div className="module-hero__detail">
              <span className="module-hero__detail-label">Durée</span>
              <span className="module-hero__detail-value">{duration}</span>
            </div>
            <div className="module-hero__detail">
              <span className="module-hero__detail-label">Compétence clé</span>
              <span className="module-hero__detail-value">{skills.fr}</span>
            </div>
          </div>
          <ul className="module-hero__tags">
            {tags.map((tag) => (
              <li key={tag} className="module-tag">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="module-body container">
        <section className="module-section module-section--summary card">
          <h2>Vue d’ensemble</h2>
          <p>{content.fr}</p>
        </section>

        <section className="module-section module-section--grid">
          <article className="module-panel card">
            <h3>Compétences visées</h3>
            <p>{skills.fr}</p>
          </article>
          <article className="module-panel card">
            <h3>Activités & mise en pratique</h3>
            <p>{activities.fr}</p>
          </article>
          <article className="module-panel card">
            <h3>Livrables attendus</h3>
            <p>{deliverables.fr}</p>
          </article>
        </section>

        <section className="module-section card">
          <h3>Concepts clés</h3>
          <ul className="module-chip-list">
            {keyConcepts.fr.map((concept) => (
              <li key={concept} className="module-chip">
                {concept}
              </li>
            ))}
          </ul>
        </section>

        <section className="module-section card">
          <h3>Ressources & outils</h3>
          <ul className="module-resource-list">
            {resources.map((resource) => (
              <li key={resource}>{resource}</li>
            ))}
          </ul>
        </section>

        {codeExample ? (
          <section className="module-section module-code">
            <div className="module-code__header">
              <h3 className="module-code__title">{codeExample.title}</h3>
              <p className="module-code__caption">
                Un extrait prêt à l’emploi pour illustrer le module.
              </p>
            </div>
            <div className="module-code__viewer code-window">
              <div className="window__bar">
                <span className="dot dot--red" />
                <span className="dot dot--yellow" />
                <span className="dot dot--green" />
                <span className="win-title">Éditeur de code</span>
              </div>
              <div className="code-columns">
                <CodeHighlight
                  label={codeLanguageLabel}
                  language={codeExample.lang}
                  source={codeExample.content}
                  tagClass={codeTagClass}
                />
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <nav className="module-pagination container">
        {previousModule ? (
          <Link className="module-pagination__link" to={`/modules/${previousModule.id.toLowerCase()}`}>
            ← {previousModule.day}
          </Link>
        ) : (
          <span />
        )}
        {nextModule ? (
          <Link className="module-pagination__link" to={`/modules/${nextModule.id.toLowerCase()}`}>
            {nextModule.day} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
