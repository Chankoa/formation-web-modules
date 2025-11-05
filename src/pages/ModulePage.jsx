import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import CodeHighlight from "../components/CodeHighlight";
import { useModuleContent } from "../context/ModuleContentContext.jsx";

function slugify(value) {
  if (!value) {
    return "";
  }
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatFileName(value, fallback) {
  const slug = slugify(value);
  if (!slug) {
    return fallback ?? "fichier";
  }
  return slug;
}

function buildExplorerStructure({ id, title, concepts, resources, activity, deliverable }) {
  const baseSlug = formatFileName(title, id?.toLowerCase() ?? "module");
  const folderName = `module-${baseSlug}`;
  const sectionDefinitions = [];

  if (concepts.length > 0) {
    sectionDefinitions.push({
      label: "📁 notions-cles/",
      items: concepts.map((concept) => `📄 ${formatFileName(concept, "concept")}.md`),
    });
  }

  if (resources.length > 0) {
    sectionDefinitions.push({
      label: "📁 ressources/",
      items: resources.map((resource) => {
        if (typeof resource === "string") {
          return `🔗 ${formatFileName(resource, "resource")}.url`;
        }

        const label = resource.label
          ?? resource.downloadFilename
          ?? resource.url
          ?? "resource";
        const icon = resource.type === "pdf" ? "📄" : "🔗";
        const extension = resource.type === "pdf" ? ".pdf" : ".url";
        return `${icon} ${formatFileName(label, "resource")}${extension}`;
      }),
    });
  }

  if (activity) {
    sectionDefinitions.push({
      label: "📁 exercice-fil-rouge/",
      items: [`📝 ${formatFileName(activity, "atelier")}.md`],
    });
  }

  if (deliverable) {
    sectionDefinitions.push({
      label: "📁 livrables/",
      items: [`📦 ${formatFileName(deliverable, "livrable")}.md`],
    });
  }

  const lines = [`📁 ${folderName}/`, "├─ 📄 README.md"];

  sectionDefinitions.forEach((section, sectionIndex) => {
    const isLastSection = sectionIndex === sectionDefinitions.length - 1;
    const headerPrefix = isLastSection ? "└" : "├";
    lines.push(`${headerPrefix}─ ${section.label}`);

    const indent = isLastSection ? "   " : "│  ";
    section.items.forEach((item, itemIndex) => {
      const itemPrefix = itemIndex === section.items.length - 1 ? "└" : "├";
      lines.push(`${indent}${itemPrefix}─ ${item}`);
    });
  });

  return lines.join("\n");
}

function normalizeResource(resource, index, moduleId) {
  if (typeof resource === "string") {
    return {
      id: `${moduleId}-resource-${index}`,
      label: resource,
      type: "text",
    };
  }

  if (!resource || typeof resource !== "object") {
    return null;
  }

  const type = resource.type
    ?? (resource.downloadUrl || resource.download ? "pdf" : resource.url ? "link" : "text");

  return {
    id: resource.id ?? `${moduleId}-resource-${index}`,
    label: resource.label ?? resource.title ?? "Ressource",
    url: resource.url ?? resource.href ?? resource.downloadUrl ?? "",
    type,
    description: resource.description ?? "",
    downloadFilename: resource.downloadFilename ?? resource.filename ?? "",
  };
}

function BookmarkIcon() {
  return (
    <svg
      className="module-highlight__icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 3h11a1.5 1.5 0 0 1 1.5 1.5v16l-7-4-7 4v-16A1.5 1.5 0 0 1 6.5 3z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      className="module-highlight__icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 17.25V21h3.75L19.81 7.94l-3.75-3.75L3 17.25z" />
      <path d="M20.71 6.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.34 1.34 3.75 3.75 1.34-1.34z" />
    </svg>
  );
}

function getModuleById(collection, id) {
  if (!id) {
    return undefined;
  }
  const normalisedId = id.trim().toUpperCase();
  return collection.find((item) => item.id?.toUpperCase() === normalisedId);
}

export default function ModulePage() {
  const { moduleId } = useParams();
  const { modules } = useModuleContent();
  const moduleList = useMemo(
    () => (Array.isArray(modules) ? modules : []),
    [modules],
  );
  const module = useMemo(
    () => getModuleById(moduleList, moduleId),
    [moduleList, moduleId],
  );

  const moduleResourcesRaw = module?.resources;
  const moduleIdentifier = module?.id;
  const moduleTags = module?.tags;

  const resourceItems = useMemo(() => {
    const entries = Array.isArray(moduleResourcesRaw) ? moduleResourcesRaw : [];
    return entries
      .map((entry, index) => normalizeResource(entry, index, moduleIdentifier ?? "module"))
      .filter(Boolean);
  }, [moduleResourcesRaw, moduleIdentifier]);
  const hasResources = resourceItems.length > 0;
  const tagList = Array.isArray(moduleTags) ? moduleTags : [];

  const currentIndex = useMemo(() => {
    if (!module) {
      return -1;
    }
    return moduleList.findIndex((item) => item.id === module.id);
  }, [module, moduleList]);

  const previousModule = currentIndex > 0 ? moduleList[currentIndex - 1] : undefined;
  const nextModule = currentIndex >= 0 && currentIndex < moduleList.length - 1
    ? moduleList[currentIndex + 1]
    : undefined;

  if (!module) {
    return (
      <main className="module-page">
        <div className="module-hero module-hero--notfound">
          <div className="container module-hero__grid module-hero__grid--single">
            <div className="module-hero__content">
              <p className="module-hero__eyebrow">Module introuvable</p>
              <h1>Oups, cette page n’existe pas.</h1>
              <p className="module-hero__objective">
                Le module que vous cherchez n’est plus disponible ou l’identifiant est incorrect.
              </p>
              <Link className="btn" to="/">Retour à l’accueil</Link>
            </div>
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
    deliverables,
    skills,
    duration,
    codeExample,
  } = module;

  const titleText = title?.fr ?? title?.en ?? "Module";
  const objectiveText = objectives?.fr ?? objectives?.en ?? "";
  const contentText = content?.fr ?? content?.en ?? "";
  const skillsText = skills?.fr ?? skills?.en ?? "";
  const deliverablesText = deliverables?.fr ?? deliverables?.en ?? "";
  const activitiesText = activities?.fr ?? activities?.en ?? "";

  const learningOutcomes = [
    {
      title: "Objectif pédagogique",
      description: objectiveText,
    },
    {
      title: "Compétence développée",
      description: skillsText,
    },
    {
      title: "Livrable attendu",
      description: deliverablesText,
    },
  ];

  const conceptList = Array.isArray(keyConcepts?.fr) ? keyConcepts.fr : [];

  const explorerStructure = buildExplorerStructure({
    id,
    title: titleText,
    concepts: conceptList,
    resources: resourceItems,
    activity: activitiesText,
    deliverable: deliverablesText,
  });

  const retentionPoints = conceptList.slice(0, 4);
  const exerciseDetails = [
    activitiesText,
    deliverablesText ? `Livrable : ${deliverablesText}` : null,
  ].filter(Boolean);
  const showHighlights = retentionPoints.length > 0 || exerciseDetails.length > 0;
  const showCodeExample = Boolean(codeExample?.content);
  const heroClusterItems = (retentionPoints.length > 0 ? retentionPoints : tagList).slice(0, 4);
  const heroNote = exerciseDetails[0] ?? "";

  const eyebrowParts = ["Création web"];
  if (day) {
    eyebrowParts.push(`Jour ${day}`);
  }
  if (duration) {
    eyebrowParts.push(duration);
  }
  const heroEyebrow = eyebrowParts.join(" · ");

  const curriculumItems = [
    ...conceptList.map((concept, index) => ({
      step: index + 1,
      title: concept,
      description: "Concept clé exploré durant ce module.",
    })),
    {
      step: conceptList.length + 1,
      title: "Mise en pratique guidée",
      description: activitiesText,
    },
    {
      step: conceptList.length + 2,
      title: "Livrables et restitution",
      description: deliverablesText,
    },
  ];

  const moduleResources = [
    {
      label: "Durée",
      value: duration,
    },
    {
      label: "Jour",
      value: day,
    },
    {
      label: "Identifiant",
      value: id,
    },
  ].filter((item) => Boolean(item.value));

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

  const codeTitle = codeExample?.title ?? "Structure de référence";
  const codeCaption = showCodeExample
    ? "Un extrait prêt à l’emploi pour illustrer le module."
    : "Cet extrait sera disponible prochainement.";

  return (
    <main className="module-page">
      <header className="module-hero">
        <div className="container module-hero__grid">
          <div className="module-hero__content">
            <Link className="module-hero__back" to="/#modules">
              ← Retour aux modules
            </Link>
            <p className="module-hero__eyebrow">{heroEyebrow}</p>
            <h1 className="module-hero__title">{titleText}</h1>
            <p className="module-hero__objective">{objectiveText}</p>
            {skillsText ? (
              <div className="module-hero__note">
                <h3>Compétence développée</h3>
                <p>{skillsText}</p>
              </div>
            ) : null}
            {tagList.length > 0 ? (
              <ul className="module-hero__tags">
                {tagList.map((tag) => (
                  <li key={tag} className="module-hero__tag-chip">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="module-hero__actions">
              <a className="btn" href="#programme">
                Commencer ce module
              </a>
              {hasResources ? (
                <a className="btn btn-secondary" href="#ressources">
                  Parcourir les ressources
                </a>
              ) : null}
            </div>
          </div>

          <div className="module-hero__visual">
            <span className="module-hero__badge">{day ? `Jour ${day}` : "Module"}</span>
            {heroClusterItems.length > 0 ? (
              <div className="module-hero__cluster">
                {heroClusterItems.map((item) => (
                  <span key={item} className="module-hero__chip">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="module-hero__card">
              <div className="module-hero__card-header">Informations clés</div>
              {moduleResources.length > 0 ? (
                <dl className="module-hero__card-body">
                  {moduleResources.map((item) => (
                    <div key={item.label} className="module-hero__card-row">
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="module-hero__card-empty">Détails en cours de préparation.</p>
              )}
              {heroNote ? <div className="module-hero__card-note">{heroNote}</div> : null}
            </div>
          </div>
        </div>
      </header>

      <div className="module-body container">
        <div className="module-layout">
          <section className="module-main">
            <section className="module-section module-summary padded-sm" id="apercu">
              <h2>Vue d’ensemble</h2>
              <p>{contentText}</p>
              <div className="module-outcomes">
                {learningOutcomes.map((item) => (
                  <article key={item.title} className="module-outcome">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="module-section module-program padded-sm" id="programme">
              <div className="module-section__header">
                <h2>Programme du jour</h2>
                <p>
                  Un parcours progressif pour découvrir, pratiquer puis restituer les notions clés.
                </p>
              </div>
              <ol className="module-program__list">
                {curriculumItems.map((item) => (
                  <li key={`${item.step}-${item.title}`} className="module-program__item">
                    <div className="module-program__index">{item.step}</div>
                    <div className="module-program__content">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="module-section module-code padded-sm" id="extrait-code">
              <div className="module-code__header">
                <h2 className="module-code__title">{codeTitle}</h2>
                <p className="module-code__caption">{codeCaption}</p>
              </div>
              <div className="module-code__grid">
                <div className="module-code__explorer code-window" aria-label={`Explorateur du module ${titleText}`}>
                  <div className="window__bar">
                    <span className="dot dot--red" />
                    <span className="dot dot--yellow" />
                    <span className="dot dot--green" />
                    <span className="win-title">Explorateur de fichiers</span>
                  </div>
                  <pre className="explorer">{explorerStructure}</pre>
                </div>

                {showCodeExample ? (
                  <div className="module-code__viewer code-window" aria-label="Extrait de code du module">
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
                ) : (
                  <div className="module-code__placeholder">
                    <p>Le code d’exemple sera partagé à l’issue de la session de pratique.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="module-section padded-sm" id="points-cles">
              <div className="module-section__header">
                <h2>Moments clés</h2>
                <p>Conseils et points d’attention pour renforcer la compréhension.</p>
              </div>
              {showHighlights ? (
                <div className="module-highlights module-highlights--inset">
                  {retentionPoints.length > 0 ? (
                    <article className="module-highlight note">
                      <div className="module-highlight__header">
                        <BookmarkIcon />
                        <h3>A retenir</h3>
                      </div>
                      <ul className="module-highlight__list">
                        {retentionPoints.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </article>
                  ) : null}
                  {exerciseDetails.length > 0 ? (
                    <article className="module-highlight exercise">
                      <div className="module-highlight__header">
                        <PencilIcon />
                        <h3>Exercice fil rouge</h3>
                      </div>
                      <ul className="module-highlight__list">
                        {exerciseDetails.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </article>
                  ) : null}
                </div>
              ) : (
                <p className="module-section__placeholder">
                  Les points clés seront partagés à l’issue de la session.
                </p>
              )}
            </section>
          </section>

          <aside className="module-aside" aria-label="Résumé du module">
            <section className="module-aside__card" id="infos">
              <h2>Détails pratiques</h2>
              <ul className="module-aside__stats">
                {moduleResources.map((item) => (
                  <li key={item.label}>
                    <span className="module-aside__stat-label">{item.label}</span>
                    <span className="module-aside__stat-value">{item.value}</span>
                  </li>
                ))}
              </ul>
            </section>

            {hasResources ? (
              <section className="module-aside__card" id="ressources">
                <h2>Outils et ressources</h2>
                <ul className="module-resource-list">
                  {resourceItems.map((resource) => (
                    <li key={resource.id}>
                      {resource.url ? (
                        <a
                          className="module-resource__link"
                          href={resource.url}
                          target={resource.type === "pdf" ? undefined : "_blank"}
                          rel={resource.type === "pdf" ? undefined : "noreferrer"}
                          download={resource.type === "pdf"
                            ? resource.downloadFilename || undefined
                            : undefined}
                        >
                          {resource.label}
                          {resource.type === "pdf" ? (
                            <span className="module-resource__badge">PDF</span>
                          ) : null}
                        </a>
                      ) : (
                        <span className="module-resource__text">{resource.label}</span>
                      )}
                      {resource.description ? (
                        <span className="module-resource__description">
                          {resource.description}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="module-aside__card">
              <h2>Focus compétences</h2>
              <p>{skillsText}</p>
              <p className="module-aside__helper">
                Développez une approche professionnelle et réutilisable pour vos projets web.
              </p>
            </section>

            <section className="module-aside__card module-aside__cta">
              <h2>Prêt à passer à l’action ?</h2>
              <p>Consignez vos notes et préparez votre restitution de fin de journée.</p>
              <a className="btn" href="#programme">
                Lancer la session
              </a>
            </section>
          </aside>
        </div>
      </div>

      <nav className="module-pagination container">
        {previousModule?.id ? (
          <Link
            className="module-pagination__link"
            to={`/modules/${previousModule.id.toLowerCase()}`}
          >
            ← {previousModule.day ?? previousModule.title?.fr ?? "Module"}
          </Link>
        ) : (
          <span />
        )}
        {nextModule?.id ? (
          <Link
            className="module-pagination__link"
            to={`/modules/${nextModule.id.toLowerCase()}`}
          >
            {nextModule.day ?? nextModule.title?.fr ?? "Module"} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
