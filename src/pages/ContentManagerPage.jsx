import { useEffect, useMemo, useState } from "react";
import { useModuleContent } from "../context/ModuleContentContext.jsx";

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `resource-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
};

const normalizeResources = (resources, moduleId) => {
  if (!Array.isArray(resources)) {
    return [];
  }
  return resources.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      return {
        id: `resource-${moduleId}-${index}`,
        label: String(entry ?? ""),
        url: "",
        type: "link",
        description: "",
        downloadFilename: "",
      };
    }

    const derivedType = entry.type
      ?? (entry.downloadUrl || entry.download ? "pdf" : "link");

    return {
      id: entry.id ?? `resource-${moduleId}-${index}`,
      label: entry.label ?? "",
      url: entry.url ?? entry.href ?? entry.downloadUrl ?? "",
      type: derivedType,
      description: entry.description ?? "",
      downloadFilename: entry.downloadFilename ?? entry.filename ?? "",
    };
  });
};

const buildFormState = (module) => {
  if (!module) {
    return null;
  }

  return {
    id: module.id,
    day: module.day ?? "",
    titleFr: module.title?.fr ?? "",
    titleEn: module.title?.en ?? "",
    objectiveFr: module.objectives?.fr ?? "",
    objectiveEn: module.objectives?.en ?? "",
    contentFr: module.content?.fr ?? "",
    contentEn: module.content?.en ?? "",
    skillsFr: module.skills?.fr ?? "",
    skillsEn: module.skills?.en ?? "",
    deliverableFr: module.deliverables?.fr ?? "",
    deliverableEn: module.deliverables?.en ?? "",
    activityFr: module.activities?.fr ?? "",
    activityEn: module.activities?.en ?? "",
    keyConceptsFr: Array.isArray(module.keyConcepts?.fr)
      ? module.keyConcepts.fr.join("\n")
      : "",
    tags: Array.isArray(module.tags) ? module.tags.join(", ") : "",
    resources: normalizeResources(module.resources, module.id),
  };
};

const splitLines = (value) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const splitCommaList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const sanitizeResourceForSave = (resource) => {
  const label = resource.label.trim();
  const url = resource.url.trim();
  const description = resource.description.trim();
  const filename = resource.downloadFilename.trim();

  if (!label && !url) {
    return null;
  }

  const base = {
    id: resource.id ?? generateId(),
    label: label || url,
    description: description || undefined,
  };

  if (resource.type === "pdf") {
    if (!url) {
      return null;
    }
    return {
      ...base,
      type: "pdf",
      url,
      downloadFilename: filename || undefined,
    };
  }

  if (resource.type === "link") {
    if (!url) {
      return base;
    }
    return {
      ...base,
      type: "link",
      url,
    };
  }

  return base;
};

export default function ContentManagerPage() {
  const { modules, updateModule, resetModules } = useModuleContent();
  const [selectedId, setSelectedId] = useState(() => modules[0]?.id ?? "");

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedId) ?? modules[0],
    [modules, selectedId],
  );

  const [formState, setFormState] = useState(() => buildFormState(selectedModule));
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setFormState(buildFormState(selectedModule));
    setStatus(null);
  }, [selectedModule]);

  if (!modules.length || !formState) {
    return (
      <main className="content-manager">
        <div className="container content-manager__inner">
          <h1>Gestion du contenu</h1>
          <p>Aucun module n’est disponible pour le moment.</p>
          <button
            type="button"
            className="btn"
            onClick={resetModules}
          >
            Restaurer les données par défaut
          </button>
        </div>
      </main>
    );
  }

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target;
    setFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleResourceChange = (index, field, value) => {
    setFormState((previous) => {
      const nextResources = previous.resources.slice();
      nextResources[index] = {
        ...nextResources[index],
        [field]: value,
      };
      return {
        ...previous,
        resources: nextResources,
      };
    });
  };

  const handleAddResource = () => {
    setFormState((previous) => ({
      ...previous,
      resources: [
        ...previous.resources,
        {
          id: generateId(),
          label: "",
          url: "",
          type: "link",
          description: "",
          downloadFilename: "",
        },
      ],
    }));
  };

  const handleRemoveResource = (index) => {
    setFormState((previous) => ({
      ...previous,
      resources: previous.resources.filter((_, resourceIndex) => resourceIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedModule) {
      return;
    }

    updateModule(selectedModule.id, (current) => ({
      ...current,
      day: formState.day.trim() || current.day,
      title: {
        fr: formState.titleFr.trim(),
        en: formState.titleEn.trim() || current.title?.en || "",
      },
      objectives: {
        fr: formState.objectiveFr.trim(),
        en: formState.objectiveEn.trim() || current.objectives?.en || "",
      },
      content: {
        fr: formState.contentFr.trim(),
        en: formState.contentEn.trim() || current.content?.en || "",
      },
      skills: {
        fr: formState.skillsFr.trim(),
        en: formState.skillsEn.trim() || current.skills?.en || "",
      },
      deliverables: {
        fr: formState.deliverableFr.trim(),
        en: formState.deliverableEn.trim() || current.deliverables?.en || "",
      },
      activities: {
        fr: formState.activityFr.trim(),
        en: formState.activityEn.trim() || current.activities?.en || "",
      },
      keyConcepts: {
        fr: splitLines(formState.keyConceptsFr),
        en: current.keyConcepts?.en ?? [],
      },
      tags: splitCommaList(formState.tags),
      resources: formState.resources
        .map(sanitizeResourceForSave)
        .filter(Boolean),
    }));

    setStatus("saved");
  };

  const handleResetData = () => {
    if (window.confirm("Voulez-vous restaurer les contenus d’origine ?")) {
      resetModules();
    }
  };

  return (
    <main className="content-manager">
      <div className="container content-manager__inner">
        <header className="content-manager__header">
          <h1>Gestion du contenu</h1>
          <p>
            Mettez à jour les textes, ressources et métadonnées de vos modules sans modifier le code source.
            Les changements sont enregistrés localement dans votre navigateur.
          </p>
        </header>

        <div className="content-manager__toolbar">
          <label className="content-manager__select">
            <span>Module à éditer</span>
            <select
              value={formState.id}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.id} · {module.title?.fr ?? "Sans titre"}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetData}
          >
            Restaurer les contenus par défaut
          </button>
        </div>

        <form className="content-manager__form" onSubmit={handleSubmit}>
          <section className="content-manager__section">
            <h2>Informations générales</h2>
            <div className="content-manager__grid">
              <label>
                <span>Jour / étape</span>
                <input
                  type="text"
                  value={formState.day}
                  onChange={handleFieldChange("day")}
                />
              </label>
              <label>
                <span>Titre (FR)</span>
                <input
                  type="text"
                  value={formState.titleFr}
                  onChange={handleFieldChange("titleFr")}
                  required
                />
              </label>
              <label>
                <span>Titre (EN)</span>
                <input
                  type="text"
                  value={formState.titleEn}
                  onChange={handleFieldChange("titleEn")}
                />
              </label>
            </div>
          </section>

          <section className="content-manager__section">
            <h2>Objectifs & contenu</h2>
            <div className="content-manager__grid">
              <label>
                <span>Objectif (FR)</span>
                <textarea
                  value={formState.objectiveFr}
                  onChange={handleFieldChange("objectiveFr")}
                />
              </label>
              <label>
                <span>Contenu (FR)</span>
                <textarea
                  value={formState.contentFr}
                  onChange={handleFieldChange("contentFr")}
                  rows={6}
                />
              </label>
              <label>
                <span>Compétence clef (FR)</span>
                <textarea
                  value={formState.skillsFr}
                  onChange={handleFieldChange("skillsFr")}
                  rows={3}
                />
              </label>
              <label>
                <span>Livrable attendu (FR)</span>
                <textarea
                  value={formState.deliverableFr}
                  onChange={handleFieldChange("deliverableFr")}
                  rows={3}
                />
              </label>
              <label>
                <span>Activité fil rouge (FR)</span>
                <textarea
                  value={formState.activityFr}
                  onChange={handleFieldChange("activityFr")}
                  rows={3}
                />
              </label>
              <label>
                <span>Concepts clés (un par ligne)</span>
                <textarea
                  value={formState.keyConceptsFr}
                  onChange={handleFieldChange("keyConceptsFr")}
                  rows={4}
                />
              </label>
            </div>
          </section>

          <section className="content-manager__section">
            <h2>Ressources & téléchargements</h2>
            <p className="content-manager__helper">
              Ajoutez des ressources externes ou des documents PDF à télécharger pour enrichir la session.
            </p>

            <div className="content-manager__resources">
              {formState.resources.map((resource, index) => (
                <div key={resource.id} className="content-manager__resource">
                  <div className="content-manager__resource-grid">
                    <label>
                      <span>Libellé</span>
                      <input
                        type="text"
                        value={resource.label}
                        onChange={(event) =>
                          handleResourceChange(index, "label", event.target.value)
                        }
                        placeholder="Guide de la session, Tutoriel vidéo..."
                      />
                    </label>
                    <label>
                      <span>Type</span>
                      <select
                        value={resource.type}
                        onChange={(event) =>
                          handleResourceChange(index, "type", event.target.value)
                        }
                      >
                        <option value="link">Lien</option>
                        <option value="pdf">PDF à télécharger</option>
                        <option value="text">Texte simple</option>
                      </select>
                    </label>
                    <label>
                      <span>URL</span>
                      <input
                        type="url"
                        value={resource.url}
                        onChange={(event) =>
                          handleResourceChange(index, "url", event.target.value)
                        }
                        placeholder="https://..."
                      />
                    </label>
                    <label>
                      <span>Nom de fichier (PDF)</span>
                      <input
                        type="text"
                        value={resource.downloadFilename}
                        onChange={(event) =>
                          handleResourceChange(index, "downloadFilename", event.target.value)
                        }
                        placeholder="livret-module.pdf"
                      />
                    </label>
                    <label className="content-manager__resource-description">
                      <span>Description</span>
                      <textarea
                        value={resource.description}
                        onChange={(event) =>
                          handleResourceChange(index, "description", event.target.value)
                        }
                        rows={2}
                      />
                    </label>
                  </div>
                  <div className="content-manager__resource-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleRemoveResource(index)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn"
                onClick={handleAddResource}
              >
                Ajouter une ressource
              </button>
            </div>
          </section>

          <section className="content-manager__section">
            <h2>Liste des tags</h2>
            <label>
              <span>Tags (séparés par des virgules)</span>
              <input
                type="text"
                value={formState.tags}
                onChange={handleFieldChange("tags")}
                placeholder="html, css, accessibilité"
              />
            </label>
          </section>

          <div className="content-manager__actions">
            <button type="submit" className="btn">
              Enregistrer les modifications
            </button>
            {status === "saved" ? (
              <span className="content-manager__status">Modifications enregistrées.</span>
            ) : null}
          </div>
        </form>
      </div>
    </main>
  );
}
