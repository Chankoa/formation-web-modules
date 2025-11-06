import { useEffect, useMemo, useState } from "react";
import { useModuleContent } from "../context/ModuleContentContext.jsx";

const FALLBACK_OWNER = "Formateur référent";

const BLOCK_TYPES = ["lesson", "exercise", "code", "tips", "resource", "checklist"];

const BLOCK_TYPE_LABELS = {
  lesson: "Section cours",
  exercise: "Exercice guidé",
  code: "Bloc code",
  tips: "Tips & astuces",
  resource: "Ressources",
  checklist: "Checklist",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publié" },
  { value: "archived", label: "Archivé" },
];

const LEVEL_OPTIONS = [
  { value: "débutant", label: "Débutant" },
  { value: "intermédiaire", label: "Intermédiaire" },
  { value: "avancé", label: "Avancé" },
];

const HERO_MEDIA_OPTIONS = [
  { value: "none", label: "Aucun" },
  { value: "image", label: "Image" },
  { value: "video", label: "Vidéo (URL)" },
  { value: "embed", label: "Intégration (iframe)" },
];

const DEVICE_OPTIONS = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

const PROGRAM_MARKDOWN_SNIPPETS = [
  { label: "Titre clé", snippet: "## À retenir\n" },
  { label: "Liste", snippet: "- Point 1\n- Point 2\n" },
  { label: "Callout", snippet: "> Astuce rapide : ...\n" },
  { label: "Checklist", snippet: "- [ ] Étape 1\n- [ ] Étape 2\n" },
];

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
};

const BLOCK_TEMPLATES = {
  lesson: () => ({
    title: "Nouvelle notion",
    content: "### Ce que tu vas explorer\n- Concept clé #1\n- Concept clé #2\n\nAstuce : précise le contexte en une phrase.",
  }),
  exercise: () => ({
    title: "Défi express",
    content: "**Mission**\n1. Étape 1\n2. Étape 2\n\nTemps conseillé : 15 minutes",
  }),
  code: () => ({
    title: "Snippet de référence",
    content: "Ce snippet illustre la mise en pratique.",
    code: "<!-- Colle ton code ici -->",
    codeLanguage: "html",
  }),
  tips: () => ({
    title: "Tips & Raccourcis",
    content: "À retenir\n- Tip n°1\n- Tip n°2",
  }),
  resource: () => ({
    title: "Ressources bonus",
    content: "À parcourir après l'atelier.",
    resources: [
      {
        id: generateId(),
        label: "Documentation MDN",
        url: "https://developer.mozilla.org/",
      },
    ],
  }),
  checklist: () => ({
    title: "Checklist de réussite",
    content: "- [ ] Étape 1 validée\n- [ ] Étape 2 validée\n- [ ] Bonus ?",
  }),
};

const normalizeResources = (resources, moduleId) => {
  if (!Array.isArray(resources)) {
    return [];
  }

  return resources.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      const label = String(entry ?? "").trim();
      if (!label) {
        return {
          id: `${moduleId}-resource-${index}`,
          label: "",
          url: "",
          type: "link",
          description: "",
          downloadFilename: "",
        };
      }
      return {
        id: `${moduleId}-resource-${index}`,
        label,
        url: "",
        type: "text",
        description: "",
        downloadFilename: "",
      };
    }

    return {
      id: entry.id ?? `${moduleId}-resource-${index}`,
      label: entry.label ?? entry.title ?? entry.url ?? "",
      url: entry.url ?? entry.href ?? "",
      type: entry.type ?? "link",
      description: entry.description ?? "",
      downloadFilename: entry.downloadFilename ?? entry.filename ?? "",
    };
  });
};

const normalizeBlockResources = (resources, moduleId, blockId) => {
  if (!Array.isArray(resources)) {
    return [];
  }

  return resources
    .map((resource, index) => {
      if (!resource || typeof resource !== "object") {
        const label = String(resource ?? "").trim();
        if (!label) {
          return {
            id: `${moduleId}-block-${blockId}-resource-${index}`,
            label: "",
            url: "",
          };
        }
        return {
          id: `${moduleId}-block-${blockId}-resource-${index}`,
          label,
          url: "",
        };
      }

      return {
        id: resource.id ?? `${moduleId}-block-${blockId}-resource-${index}`,
        label: resource.label ?? resource.title ?? resource.url ?? "",
        url: resource.url ?? resource.href ?? "",
      };
    })
    .filter((resource) => resource.label || resource.url);
};

const normalizeProgramBlocks = (program, moduleId) => {
  if (!Array.isArray(program)) {
    return [];
  }

  return program.map((block, index) => {
    const blockId = block.id ?? `${moduleId}-block-${index}`;
    return {
      id: blockId,
      type: BLOCK_TYPES.includes(block.type) ? block.type : "lesson",
      title: block.title ?? "",
      content: block.content ?? "",
      duration: block.duration ?? "",
      code: block.code ?? "",
      codeLanguage: block.codeLanguage ?? "",
      mediaType: block.media?.type ?? "none",
      mediaUrl: block.media?.url ?? "",
      mediaCaption: block.media?.caption ?? "",
      resources: normalizeBlockResources(block.resources, moduleId, blockId),
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
    duration: module.duration ?? "",
    level: module.level ?? "",
    status: module.status ?? "draft",
    owner: module.owner ?? module.metadata?.responsible ?? FALLBACK_OWNER,
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
    heroMediaType: module.heroMedia?.type ?? "none",
    heroMediaUrl: module.heroMedia?.url ?? "",
    heroMediaCaption: module.heroMedia?.caption ?? "",
    resources: normalizeResources(module.resources, module.id),
    program: normalizeProgramBlocks(module.program, module.id),
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
  const type = resource.type ?? "link";

  if (!label && !url) {
    return null;
  }

  const base = {
    id: resource.id ?? generateId(),
    label: label || url,
    description: description || undefined,
  };

  if (type === "pdf" || type === "file") {
    if (!url) {
      return {
        ...base,
        type: "text",
      };
    }
    return {
      ...base,
      type,
      url,
      downloadFilename: filename || undefined,
    };
  }

  if (type === "link") {
    return {
      ...base,
      type: "link",
      url,
    };
  }

  return {
    ...base,
    type: "text",
  };
};

const sanitizeBlockResourceForSave = (resource, blockIndex, resourceIndex) => {
  const label = resource.label.trim();
  const url = resource.url.trim();

  if (!label && !url) {
    return null;
  }

  return {
    id: resource.id ?? `block-${blockIndex}-resource-${resourceIndex}`,
    label: label || url,
    url,
  };
};

const sanitizeProgramForSave = (program, moduleId) => {
  if (!Array.isArray(program)) {
    return [];
  }

  return program.map((block, index) => ({
    id: block.id ?? `${moduleId}-block-${index}`,
    type: BLOCK_TYPES.includes(block.type) ? block.type : "lesson",
    title: block.title.trim(),
    content: block.content.trim(),
    duration: block.duration.trim(),
    code: block.code,
    codeLanguage: block.codeLanguage.trim(),
    media: {
      type: block.mediaType ?? "none",
      url: block.mediaUrl.trim(),
      caption: block.mediaCaption.trim(),
    },
    resources: Array.isArray(block.resources)
      ? block.resources
          .map((resource, resourceIndex) =>
            sanitizeBlockResourceForSave(resource, index, resourceIndex),
          )
          .filter(Boolean)
      : [],
  }));
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const summariseText = (value, maxLength = 140) => {
  if (!value) {
    return "";
  }
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) {
    return clean;
  }
  return `${clean.slice(0, maxLength - 1)}`;
};

const matchSearch = (module, term) => {
  if (!term) {
    return true;
  }
  const lowerTerm = term.toLowerCase();
  const fields = [
    module.id,
    module.day,
    module.title?.fr,
    module.title?.en,
    module.owner,
    module.level,
    module.status,
    ...(Array.isArray(module.tags) ? module.tags : []),
  ];

  return fields.some((field) =>
    field && field.toLowerCase().includes(lowerTerm),
  );
};

const buildPreviewEyebrow = (formState) => {
  const parts = [];
  if (formState.level) {
    parts.push(`Niveau ${formState.level}`);
  }
  if (formState.day) {
    parts.push(formState.day);
  }
  if (formState.duration) {
    parts.push(formState.duration);
  }
  return parts.join("  ") || "Parcours création web";
};

function ModuleCard({ module, isActive, onSelect }) {
  const title = module.title?.fr ?? module.title?.en ?? "Sans titre";
  const status = module.status ?? "draft";
  const statusLabel = STATUS_LABELS[status] ?? status;
  const updatedAt = formatDateTime(module.metadata?.updatedAt ?? module.updatedAt);
  const owner = module.owner ?? module.metadata?.responsible ?? FALLBACK_OWNER;
  const level = module.level ?? "";
  const tags = Array.isArray(module.tags) ? module.tags.slice(0, 3) : [];
  const objective = summariseText(
    module.objectives?.fr ?? module.objectives?.en ?? module.content?.fr ?? "",
    120,
  );

  return (
    <button
      type="button"
      className={[
        "content-manager__module-card",
        isActive ? "content-manager__module-card--active" : "",
      ].filter(Boolean).join(" ")}
      onClick={() => onSelect(module.id)}
    >
      <div className="content-manager__module-card-header">
        <span className="content-manager__module-id">{module.id}</span>
        <span className={`content-manager__status-badge content-manager__status-badge--${status}`}>
          {statusLabel}
        </span>
      </div>
      <h3 className="content-manager__module-title">{title}</h3>
      <p className="content-manager__module-summary">{objective || "Ajoutez une accroche inspirante."}</p>
      <div className="content-manager__module-meta">
        <span>{owner}</span>
        <span>{level}</span>
        <span>{updatedAt}</span>
      </div>
      {tags.length ? (
        <ul className="content-manager__module-tags">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      ) : null}
    </button>
  );
}

function DeviceSwitch({ value, onChange }) {
  return (
    <div className="content-manager__device-switch">
      {DEVICE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={[
            "content-manager__device-btn",
            value === option.value ? "is-active" : "",
          ].filter(Boolean).join(" ")}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ModuleHeroPreview({ formState, device }) {
  const eyebrow = buildPreviewEyebrow(formState);
  const heroTags = splitCommaList(formState.tags);
  const conceptChips = heroTags.length
    ? heroTags.slice(0, 4)
    : splitLines(formState.keyConceptsFr).slice(0, 4);
  const note = formState.skillsFr;
  const firstBlock = formState.program?.[0];
  const highlightTitle = firstBlock?.title || "Programme";
  const highlightDescription = summariseText(firstBlock?.content ?? "", 90) || "Ajoutez un bloc pour lancer la progression.";
  const heroBadge = formState.day || "Module";
  const mediaType = formState.heroMediaType;
  const mediaUrl = formState.heroMediaUrl;
  const mediaCaption = formState.heroMediaCaption;

  return (
    <div className={`content-manager__preview-stage content-manager__preview-stage--${device}`}>
      <div className="module-hero module-hero--preview">
        <div className="module-hero__grid">
          <div className="module-hero__content">
            <p className="module-hero__eyebrow">{eyebrow}</p>
            <h1 className="module-hero__title">{formState.titleFr || "Titre du module"}</h1>
            <p className="module-hero__objective">{formState.objectiveFr || "Décrivez lobjectif pratique de la session."}</p>
            {note ? (
              <div className="module-hero__note">
                <h3>Compétence développée</h3>
                <p>{note}</p>
              </div>
            ) : null}
            {heroTags.length ? (
              <ul className="module-hero__tags">
                {heroTags.slice(0, 6).map((tag) => (
                  <li key={tag} className="module-hero__tag-chip">{tag}</li>
                ))}
              </ul>
            ) : null}
            <div className="module-hero__actions">
              <button type="button" className="btn" disabled>Aperçu</button>
              <button type="button" className="btn btn-secondary" disabled>Ressources</button>
            </div>
          </div>

          <div className="module-hero__visual">
            <span className="module-hero__badge">{heroBadge}</span>
            {conceptChips.length ? (
              <div className="module-hero__cluster">
                {conceptChips.map((item) => (
                  <span key={item} className="module-hero__chip">{item}</span>
                ))}
              </div>
            ) : null}
            <div className="module-hero__card">
              <div className="module-hero__card-header">Informations clés</div>
              <dl className="module-hero__card-body">
                {formState.duration ? (
                  <div>
                    <dt>Durée</dt>
                    <dd>{formState.duration}</dd>
                  </div>
                ) : null}
                {formState.level ? (
                  <div>
                    <dt>Niveau</dt>
                    <dd>{formState.level}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Zoom</dt>
                  <dd>
                    <strong>{highlightTitle}</strong>
                    <span>{highlightDescription}</span>
                  </dd>
                </div>
              </dl>
            </div>
            {mediaType === "image" && mediaUrl ? (
              <figure className="module-hero__media">
                <img src={mediaUrl} alt={mediaCaption || formState.titleFr || "Visuel du module"} />
                {mediaCaption ? <figcaption>{mediaCaption}</figcaption> : null}
              </figure>
            ) : null}
            {mediaType === "video" && mediaUrl ? (
              <div className="module-hero__media module-hero__media--placeholder">
                <span>Vidéo intégrée</span>
                <small>{mediaUrl}</small>
              </div>
            ) : null}
            {mediaType === "embed" && mediaUrl ? (
              <div className="module-hero__media module-hero__media--placeholder">
                <span>Embed</span>
                <small>{mediaUrl}</small>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryList({ entries, onRestore }) {
  if (!entries.length) {
    return <p className="content-manager__history-empty">Pas encore dhistorique pour ce module.</p>;
  }

  return (
    <ul className="content-manager__history-list">
      {entries.map((entry) => (
        <li key={entry.id} className="content-manager__history-item">
          <div>
            <strong>{entry.label}</strong>
            <span>{formatDateTime(entry.updatedAt)}</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onRestore(entry.id)}
          >
            Restaurer
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function ContentManagerPage() {
  const {
    modules,
    updateModule,
    resetModules,
    createModule,
    duplicateModule,
    deleteModule,
    restoreModuleVersion,
  } = useModuleContent();

  const [selectedId, setSelectedId] = useState(() => modules[0]?.id ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [status, setStatus] = useState(null);

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedId) ?? modules[0],
    [modules, selectedId],
  );

  const [formState, setFormState] = useState(() => buildFormState(selectedModule));

  useEffect(() => {
    if (!modules.length) {
      setSelectedId("");
      setFormState(null);
      return;
    }

    if (!modules.some((module) => module.id === selectedId)) {
      setSelectedId(modules[0].id);
    }
  }, [modules, selectedId]);

  useEffect(() => {
    setFormState(buildFormState(selectedModule));
    setStatus(null);
  }, [selectedModule]);

  const filteredModules = useMemo(() => {
    if (!searchTerm) {
      return modules;
    }
    return modules.filter((module) => matchSearch(module, searchTerm));
  }, [modules, searchTerm]);

  const moduleHistory = Array.isArray(selectedModule?.history)
    ? selectedModule.history
    : [];
  const metadata = selectedModule?.metadata ?? {};

  const statusMessages = {
    saved: "Modifications enregistrées.",
    created: "Nouveau module créé.",
    duplicated: "Module dupliqué.",
    deleted: "Module supprimé.",
    restored: "Version restaurée.",
  };

  if (!modules.length || !formState) {
    return (
      <main className="content-manager">
        <div className="container content-manager__inner">
          <h1>Gestion du contenu</h1>
          <p>Aucun module nest disponible pour le moment.</p>
          <button type="button" className="btn" onClick={resetModules}>
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

  const handleSelectModule = (moduleId) => {
    setSelectedId(moduleId);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateModuleClick = () => {
    const newModuleId = createModule();
    if (newModuleId) {
      setSelectedId(newModuleId);
      setStatus("created");
    }
  };

  const handleDuplicateModuleClick = () => {
    if (!selectedModule) {
      return;
    }
    const duplicatedId = duplicateModule(selectedModule.id);
    if (duplicatedId) {
      setSelectedId(duplicatedId);
      setStatus("duplicated");
    }
  };

  const handleDeleteModuleClick = () => {
    if (!selectedModule) {
      return;
    }
    if (modules.length <= 1) {
      window.alert?.("Impossible de supprimer le dernier module.");
      return;
    }
    if (window.confirm?.(`Supprimer définitivement le module ${selectedModule.id} ?`)) {
      deleteModule(selectedModule.id);
      setStatus("deleted");
    }
  };

  const handleHeroMediaTypeChange = (event) => {
    const { value } = event.target;
    setFormState((previous) => ({
      ...previous,
      heroMediaType: value,
      heroMediaUrl: value === "none" ? "" : previous.heroMediaUrl,
    }));
  };

  const handleHeroMediaUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormState((previous) => ({
        ...previous,
        heroMediaType: "image",
        heroMediaUrl: typeof reader.result === "string" ? reader.result : previous.heroMediaUrl,
        heroMediaCaption: previous.heroMediaCaption || file.name,
      }));
    };
    reader.readAsDataURL(file);
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

  const handleProgramBlockChange = (blockId, field, value) => {
    setFormState((previous) => ({
      ...previous,
      program: previous.program.map((block) =>
        block.id === blockId
          ? {
            ...block,
            [field]: value,
          }
          : block,
      ),
    }));
  };

  const handleAddProgramBlock = (type) => {
    const templateFactory = BLOCK_TEMPLATES[type] ?? BLOCK_TEMPLATES.lesson;
    const template = templateFactory();
    setFormState((previous) => ({
      ...previous,
      program: [
        ...previous.program,
        {
          id: generateId(),
          type,
          title: template.title ?? "",
          content: template.content ?? "",
          duration: template.duration ?? "",
          code: template.code ?? "",
          codeLanguage: template.codeLanguage ?? "",
          mediaType: "none",
          mediaUrl: "",
          mediaCaption: "",
          resources: template.resources
            ? template.resources.map((resource) => ({
              id: resource.id ?? generateId(),
              label: resource.label ?? "",
              url: resource.url ?? "",
            }))
            : [],
        },
      ],
    }));
  };

  const handleRemoveProgramBlock = (blockId) => {
    setFormState((previous) => ({
      ...previous,
      program: previous.program.filter((block) => block.id !== blockId),
    }));
  };

  const handleMoveProgramBlock = (blockId, direction) => {
    setFormState((previous) => {
      const index = previous.program.findIndex((block) => block.id === blockId);
      if (index < 0) {
        return previous;
      }
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= previous.program.length) {
        return previous;
      }
      const nextProgram = previous.program.slice();
      const [moved] = nextProgram.splice(index, 1);
      nextProgram.splice(targetIndex, 0, moved);
      return {
        ...previous,
        program: nextProgram,
      };
    });
  };

  const handleApplyTemplate = (blockId) => {
    setFormState((previous) => ({
      ...previous,
      program: previous.program.map((block) => {
        if (block.id !== blockId) {
          return block;
        }
        const templateFactory = BLOCK_TEMPLATES[block.type] ?? BLOCK_TEMPLATES.lesson;
        const template = templateFactory();
        return {
          ...block,
          title: block.title || template.title || "",
          content: block.content || template.content || "",
          code: block.code || template.code || "",
          codeLanguage: block.codeLanguage || template.codeLanguage || block.codeLanguage,
          resources: block.resources.length
            ? block.resources
            : template.resources
              ? template.resources.map((resource) => ({
                id: resource.id ?? generateId(),
                label: resource.label ?? "",
                url: resource.url ?? "",
              }))
              : [],
        };
      }),
    }));
  };

  const handleProgramSnippet = (blockId, snippet) => {
    setFormState((previous) => ({
      ...previous,
      program: previous.program.map((block) =>
        block.id === blockId
          ? {
            ...block,
            content: `${block.content}${block.content.endsWith("\n") ? "" : "\n"}${snippet}`,
          }
          : block,
      ),
    }));
  };

  const handleAddProgramResource = (blockId) => {
    setFormState((previous) => ({
      ...previous,
      program: previous.program.map((block) =>
        block.id === blockId
          ? {
            ...block,
            resources: [
              ...block.resources,
              {
                id: generateId(),
                label: "",
                url: "",
              },
            ],
          }
          : block,
      ),
    }));
  };

  const handleProgramResourceChange = (blockId, resourceId, field, value) => {
    setFormState((previous) => ({
      ...previous,
      program: previous.program.map((block) =>
        block.id === blockId
          ? {
            ...block,
            resources: block.resources.map((resource) =>
              resource.id === resourceId
                ? {
                  ...resource,
                  [field]: value,
                }
                : resource,
            ),
          }
          : block,
      ),
    }));
  };

  const handleRemoveProgramResource = (blockId, resourceId) => {
    setFormState((previous) => ({
      ...previous,
      program: previous.program.map((block) =>
        block.id === blockId
          ? {
            ...block,
            resources: block.resources.filter((resource) => resource.id !== resourceId),
          }
          : block,
      ),
    }));
  };

  const handleRestoreHistory = (historyId) => {
    if (!selectedModule) {
      return;
    }
    restoreModuleVersion(selectedModule.id, historyId);
    setStatus("restored");
  };

  const handlePreviewDeviceChange = (device) => {
    setPreviewDevice(device);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedModule) {
      return;
    }

    const moduleId = selectedModule.id;

    updateModule(
      moduleId,
      (current) => ({
        ...current,
        day: formState.day.trim() || current.day,
        duration: formState.duration.trim(),
        level: formState.level.trim() || current.level,
        status: formState.status,
        owner: formState.owner.trim() || current.owner || FALLBACK_OWNER,
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
        heroMedia: {
          type: formState.heroMediaType,
          url: formState.heroMediaUrl.trim(),
          caption: formState.heroMediaCaption.trim(),
        },
        resources: formState.resources
          .map(sanitizeResourceForSave)
          .filter(Boolean),
        program: sanitizeProgramForSave(formState.program, moduleId),
        metadata: {
          ...(current.metadata ?? {}),
          status: formState.status,
          responsible: formState.owner.trim() || current.metadata?.responsible || FALLBACK_OWNER,
        },
      }),
      {
        historyLabel: `Mise à jour (${new Date().toLocaleString("fr-FR")})`,
      },
    );

    setStatus("saved");
  };

  const handleResetData = () => {
    if (window.confirm?.("Voulez-vous restaurer les contenus d'origine ?")) {
      resetModules();
    }
  };

  return (
    <main className="content-manager">
      <div className="container content-manager__inner">
        <header className="content-manager__header">
          <h1>Gestion du contenu</h1>
          <p>
            Pilotez vos modules, créez de nouvelles sessions et alimentez le programme interactif sans toucher au code. Les changements sont enregistrés localement et resteront actifs tant que vous ne réinitialisez pas les données.
          </p>
        </header>

        <section className="content-manager__dashboard">
          <div className="content-manager__toolbar">
            <label className="content-manager__search">
              <span className="sr-only">Rechercher un module</span>
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Rechercher un module, un thème, un niveau"
              />
            </label>
            <div className="content-manager__toolbar-actions">
              <button type="button" className="btn" onClick={handleCreateModuleClick}>
                + Nouveau module
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDuplicateModuleClick}
                disabled={!selectedModule}
              >
                Dupliquer
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDeleteModuleClick}
                disabled={!selectedModule || modules.length <= 1}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetData}
              >
                Restaurer les contenus
              </button>
            </div>
          </div>

          {filteredModules.length ? null : (
            <p className="content-manager__empty">Aucun module ne correspond à votre recherche. Affichage de la liste complète.</p>
          )}

          <div className="content-manager__module-grid">
            {(filteredModules.length ? filteredModules : modules).map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                isActive={module.id === selectedModule.id}
                onSelect={handleSelectModule}
              />
            ))}
          </div>
        </section>

        <div className="content-manager__workspace">
          <form className="content-manager__form" onSubmit={handleSubmit}>
            <section className="content-manager__section">
              <h2>Paramètres du module</h2>
              <div className="content-manager__grid content-manager__grid--auto">
                <label>
                  <span>Jour / étape</span>
                  <input type="text" value={formState.day} onChange={handleFieldChange("day")} />
                </label>
                <label>
                  <span>Durée estimée</span>
                  <input type="text" value={formState.duration} onChange={handleFieldChange("duration")} placeholder="7h (3h théorie + 4h pratique)" />
                </label>
                <label>
                  <span>Niveau</span>
                  <select value={formState.level} onChange={handleFieldChange("level")}>
                    <option value=""></option>
                    {LEVEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Statut</span>
                  <select value={formState.status} onChange={handleFieldChange("status")}>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Responsable</span>
                  <input type="text" value={formState.owner} onChange={handleFieldChange("owner")} placeholder="Formateur référent" />
                </label>
              </div>
            </section>

            <section className="content-manager__section">
              <h2>Accroche & titres</h2>
              <div className="content-manager__grid">
                <label>
                  <span>Titre (FR)</span>
                  <input type="text" value={formState.titleFr} onChange={handleFieldChange("titleFr")} required />
                </label>
                <label>
                  <span>Titre (EN)</span>
                  <input type="text" value={formState.titleEn} onChange={handleFieldChange("titleEn")} />
                </label>
                <label>
                  <span>Objectif (FR)</span>
                  <textarea value={formState.objectiveFr} onChange={handleFieldChange("objectiveFr")} rows={3} />
                </label>
                <label>
                  <span>Objectif (EN)</span>
                  <textarea value={formState.objectiveEn} onChange={handleFieldChange("objectiveEn")} rows={3} />
                </label>
                <label>
                  <span>Résumé narratif (FR)</span>
                  <textarea value={formState.contentFr} onChange={handleFieldChange("contentFr")} rows={4} />
                </label>
                <label>
                  <span>Résumé narratif (EN)</span>
                  <textarea value={formState.contentEn} onChange={handleFieldChange("contentEn")} rows={4} />
                </label>
              </div>
            </section>

            <section className="content-manager__section">
              <h2>Pédagogie & livrables</h2>
              <div className="content-manager__grid">
                <label>
                  <span>Compétence clef (FR)</span>
                  <textarea value={formState.skillsFr} onChange={handleFieldChange("skillsFr")} rows={3} />
                </label>
                <label>
                  <span>Compétence clef (EN)</span>
                  <textarea value={formState.skillsEn} onChange={handleFieldChange("skillsEn")} rows={3} />
                </label>
                <label>
                  <span>Livrable attendu (FR)</span>
                  <textarea value={formState.deliverableFr} onChange={handleFieldChange("deliverableFr")} rows={3} />
                </label>
                <label>
                  <span>Livrable attendu (EN)</span>
                  <textarea value={formState.deliverableEn} onChange={handleFieldChange("deliverableEn")} rows={3} />
                </label>
                <label>
                  <span>Activité fil rouge (FR)</span>
                  <textarea value={formState.activityFr} onChange={handleFieldChange("activityFr")} rows={3} />
                </label>
                <label>
                  <span>Activité fil rouge (EN)</span>
                  <textarea value={formState.activityEn} onChange={handleFieldChange("activityEn")} rows={3} />
                </label>
                <label className="content-manager__fullwidth">
                  <span>Concepts clés (un par ligne)</span>
                  <textarea value={formState.keyConceptsFr} onChange={handleFieldChange("keyConceptsFr")} rows={4} />
                </label>
                <label className="content-manager__fullwidth">
                  <span>Tags (séparés par des virgules)</span>
                  <input type="text" value={formState.tags} onChange={handleFieldChange("tags")} placeholder="html, css, accessibilité" />
                </label>
              </div>
            </section>

            <section className="content-manager__section">
              <h2>Hero & média</h2>
              <div className="content-manager__grid content-manager__grid--auto">
                <label>
                  <span>Type de média</span>
                  <select value={formState.heroMediaType} onChange={handleHeroMediaTypeChange}>
                    {HERO_MEDIA_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>URL du média</span>
                  <input type="url" value={formState.heroMediaUrl} onChange={handleFieldChange("heroMediaUrl")} placeholder="https://..." />
                </label>
                <label>
                  <span>Légende / crédit</span>
                  <input type="text" value={formState.heroMediaCaption} onChange={handleFieldChange("heroMediaCaption")} placeholder="Crédit photo ou intention" />
                </label>
                <label>
                  <span>Importer une image</span>
                  <input type="file" accept="image/*" onChange={handleHeroMediaUpload} />
                </label>
              </div>
            </section>

            <section className="content-manager__section">
              <h2>Ressources & téléchargements</h2>
              <p className="content-manager__helper">
                Ajoutez des ressources externes, des PDF ou des informations textuelles complémentaires.
              </p>
              <div className="content-manager__resources">
                {formState.resources.map((resource, index) => (
                  <div key={resource.id} className="content-manager__resource">
                    <div className="content-manager__resource-grid">
                      <label>
                        <span>Libellé</span>
                        <input type="text" value={resource.label} onChange={(event) => handleResourceChange(index, "label", event.target.value)} placeholder="Guide de la session, Tutoriel vidéo..." />
                      </label>
                      <label>
                        <span>Type</span>
                        <select value={resource.type} onChange={(event) => handleResourceChange(index, "type", event.target.value)}>
                          <option value="link">Lien</option>
                          <option value="pdf">PDF à télécharger</option>
                          <option value="file">Fichier</option>
                          <option value="text">Texte simple</option>
                        </select>
                      </label>
                      <label>
                        <span>URL</span>
                        <input type="url" value={resource.url} onChange={(event) => handleResourceChange(index, "url", event.target.value)} placeholder="https://..." />
                      </label>
                      <label>
                        <span>Nom de fichier (PDF)</span>
                        <input type="text" value={resource.downloadFilename} onChange={(event) => handleResourceChange(index, "downloadFilename", event.target.value)} placeholder="livret-module.pdf" />
                      </label>
                      <label className="content-manager__resource-description">
                        <span>Description</span>
                        <textarea value={resource.description} onChange={(event) => handleResourceChange(index, "description", event.target.value)} rows={2} />
                      </label>
                    </div>
                    <div className="content-manager__resource-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => handleRemoveResource(index)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn" onClick={handleAddResource}>
                  Ajouter une ressource
                </button>
              </div>
            </section>

            <section className="content-manager__section">
              <h2>Programme interactif</h2>
              <p className="content-manager__helper">
                Composez chaque étape du module. Ajoutez des blocs cours, des exercices, du code ou des tips. Utilisez les raccourcis pour injecter du Markdown léger.
              </p>
              <div className="content-manager__program">
                {formState.program.map((block, index) => (
                  <div key={block.id} className="content-manager__program-card">
                    <div className="content-manager__program-card-header">
                      <div>
                        <span className="content-manager__program-chip">{BLOCK_TYPE_LABELS[block.type]}</span>
                        <span className="content-manager__program-index">#{index + 1}</span>
                      </div>
                      <div className="content-manager__program-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => handleMoveProgramBlock(block.id, -1)} disabled={index === 0}>
                          
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => handleMoveProgramBlock(block.id, 1)} disabled={index === formState.program.length - 1}>
                          
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => handleRemoveProgramBlock(block.id)}>
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <div className="content-manager__grid content-manager__grid--auto">
                      <label>
                        <span>Type de bloc</span>
                        <select value={block.type} onChange={(event) => handleProgramBlockChange(block.id, "type", event.target.value)}>
                          {BLOCK_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {BLOCK_TYPE_LABELS[type]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Titre du bloc</span>
                        <input type="text" value={block.title} onChange={(event) => handleProgramBlockChange(block.id, "title", event.target.value)} placeholder="Nom de la séquence" />
                      </label>
                      <label>
                        <span>Durée indicative</span>
                        <input type="text" value={block.duration} onChange={(event) => handleProgramBlockChange(block.id, "duration", event.target.value)} placeholder="12 min, 30 min..." />
                      </label>
                    </div>

                    <label className="content-manager__textarea">
                      <span>Contenu (Markdown léger)</span>
                      <textarea value={block.content} onChange={(event) => handleProgramBlockChange(block.id, "content", event.target.value)} rows={5} />
                    </label>

                    <div className="content-manager__program-snippets">
                      <span>Raccourcis</span>
                      {PROGRAM_MARKDOWN_SNIPPETS.map((snippet) => (
                        <button
                          key={snippet.label}
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleProgramSnippet(block.id, snippet.snippet)}
                        >
                          {snippet.label}
                        </button>
                      ))}
                      <button type="button" className="btn btn-secondary" onClick={() => handleApplyTemplate(block.id)}>
                        Template {BLOCK_TYPE_LABELS[block.type]}
                      </button>
                    </div>

                    {block.type === "code" ? (
                      <>
                        <label>
                          <span>Langage</span>
                          <input type="text" value={block.codeLanguage} onChange={(event) => handleProgramBlockChange(block.id, "codeLanguage", event.target.value)} placeholder="html, css, js..." />
                        </label>
                        <label className="content-manager__textarea">
                          <span>Code</span>
                          <textarea value={block.code} onChange={(event) => handleProgramBlockChange(block.id, "code", event.target.value)} rows={6} />
                        </label>
                      </>
                    ) : null}

                    <div className="content-manager__grid content-manager__grid--auto">
                      <label>
                        <span>Média</span>
                        <select value={block.mediaType} onChange={(event) => handleProgramBlockChange(block.id, "mediaType", event.target.value)}>
                          {HERO_MEDIA_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>URL média</span>
                        <input type="url" value={block.mediaUrl} onChange={(event) => handleProgramBlockChange(block.id, "mediaUrl", event.target.value)} placeholder="https://..." />
                      </label>
                      <label>
                        <span>Légende média</span>
                        <input type="text" value={block.mediaCaption} onChange={(event) => handleProgramBlockChange(block.id, "mediaCaption", event.target.value)} />
                      </label>
                    </div>

                    <div className="content-manager__block-resources">
                      <h4>Ressources du bloc</h4>
                      {block.resources.map((resource) => (
                        <div key={resource.id} className="content-manager__block-resource">
                          <label>
                            <span>Libellé</span>
                            <input type="text" value={resource.label} onChange={(event) => handleProgramResourceChange(block.id, resource.id, "label", event.target.value)} placeholder="Titre du lien" />
                          </label>
                          <label>
                            <span>URL</span>
                            <input type="url" value={resource.url} onChange={(event) => handleProgramResourceChange(block.id, resource.id, "url", event.target.value)} placeholder="https://..." />
                          </label>
                          <button type="button" className="btn btn-secondary" onClick={() => handleRemoveProgramResource(block.id, resource.id)}>
                            Retirer
                          </button>
                        </div>
                      ))}
                      <button type="button" className="btn btn-secondary" onClick={() => handleAddProgramResource(block.id)}>
                        Ajouter une ressource
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="content-manager__program-toolbar">
                {BLOCK_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleAddProgramBlock(type)}
                  >
                    + {BLOCK_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </section>

            <div className="content-manager__actions">
              <button type="submit" className="btn">
                Enregistrer les modifications
              </button>
              {status ? (
                <span className="content-manager__status">{statusMessages[status]}</span>
              ) : null}
            </div>
          </form>

          <aside className="content-manager__sidebar">
            <div className="content-manager__preview">
              <div className="content-manager__preview-header">
                <h3>Aperçu en direct</h3>
                <DeviceSwitch value={previewDevice} onChange={handlePreviewDeviceChange} />
              </div>
              <ModuleHeroPreview formState={formState} device={previewDevice} />
            </div>
            <div className="content-manager__meta">
              <h3>Métadonnées</h3>
              <dl>
                <div>
                  <dt>Dernière mise à jour</dt>
                  <dd>{formatDateTime(metadata.updatedAt)}</dd>
                </div>
                <div>
                  <dt>Créé le</dt>
                  <dd>{formatDateTime(metadata.createdAt)}</dd>
                </div>
                <div>
                  <dt>Responsable</dt>
                  <dd>{formState.owner || metadata.responsible || FALLBACK_OWNER}</dd>
                </div>
              </dl>
            </div>
            <div className="content-manager__history">
              <h3>Historique</h3>
              <HistoryList entries={moduleHistory} onRestore={handleRestoreHistory} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
