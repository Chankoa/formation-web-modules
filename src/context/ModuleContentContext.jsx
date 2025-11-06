/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import modulesSource from "../data/modules-formation-web.json";

const STORAGE_KEY = "formation-web-modules-content";

const PROGRAM_BLOCK_TYPES = ["lesson", "exercise", "code", "tips", "resource", "checklist"];
const DEFAULT_OWNER = "Formateur référent";
const DEFAULT_STATUS = "draft";
const DEFAULT_LEVEL = "intermédiaire";

const ensureString = (value) => (typeof value === "string" ? value : "");

const ensureArrayOfStrings = (value) =>
  Array.isArray(value)
    ? value
        .map((entry) => ensureString(entry))
        .filter((entry) => entry.length > 0)
    : [];

const randomId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Math.round(Math.random() * 1_000_000)}-${Date.now()}`;
};

const ensureFieldObject = (value) =>
  value && typeof value === "object"
    ? {
      fr: ensureString(value.fr),
      en: ensureString(value.en),
    }
    : { fr: "", en: "" };

const sanitizeHeroMedia = (media) => {
  if (!media || typeof media !== "object") {
    return {
      type: "none",
      url: "",
      caption: "",
    };
  }

  const type = ["image", "video", "embed", "none"].includes(media.type)
    ? media.type
    : "none";

  return {
    type,
    url: ensureString(media.url),
    caption: ensureString(media.caption),
  };
};

const sanitizeCodeExample = (codeExample) => {
  if (!codeExample || typeof codeExample !== "object") {
    return {
      lang: "",
      title: "",
      content: "",
    };
  }

  return {
    lang: ensureString(codeExample.lang),
    title: ensureString(codeExample.title),
    content: ensureString(codeExample.content),
  };
};

const sanitizeModuleResources = (resources, moduleId) => {
  if (!Array.isArray(resources)) {
    return [];
  }

  return resources
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") {
        const label = ensureString(entry);
        if (!label) {
          return null;
        }
        return {
          id: `${moduleId}-resource-${index}`,
          label,
          type: "text",
          url: "",
          description: "",
          downloadFilename: "",
        };
      }

      const normalizedType = ["pdf", "file", "link", "text"].includes(entry.type)
        ? entry.type
        : entry.downloadFilename || entry.downloadUrl
          ? "pdf"
          : entry.url
            ? "link"
            : "text";

      return {
        id: entry.id ?? `${moduleId}-resource-${index}`,
        label: ensureString(entry.label)
          || ensureString(entry.title)
          || ensureString(entry.url),
        url: ensureString(entry.url)
          || ensureString(entry.href)
          || ensureString(entry.downloadUrl),
        type: normalizedType,
        description: ensureString(entry.description),
        downloadFilename: ensureString(entry.downloadFilename)
          || ensureString(entry.filename),
      };
    })
    .filter((resource) => Boolean(resource?.label));
};

const sanitizeProgramBlock = (block, index, moduleId) => {
  if (!block || typeof block !== "object") {
    return null;
  }

  const type = PROGRAM_BLOCK_TYPES.includes(block.type) ? block.type : "lesson";

  const blockResources = Array.isArray(block.resources)
    ? block.resources
        .map((resource, resourceIndex) => {
          if (!resource || typeof resource !== "object") {
            const label = ensureString(resource);
            if (!label) {
              return null;
            }
            return {
              id: `${moduleId}-block-${index}-resource-${resourceIndex}`,
              label,
              url: "",
            };
          }

          return {
            id: resource.id ?? `${moduleId}-block-${index}-resource-${resourceIndex}`,
            label: ensureString(resource.label),
            url: ensureString(resource.url),
          };
        })
        .filter((resource) => Boolean(resource?.label))
    : [];

  const media = block.media && typeof block.media === "object"
    ? {
      type: ["image", "video", "embed", "none"].includes(block.media.type)
        ? block.media.type
        : "none",
      url: ensureString(block.media.url),
      caption: ensureString(block.media.caption),
    }
    : {
      type: "none",
      url: "",
      caption: "",
    };

  return {
    id: block.id ?? `${moduleId}-block-${index}`,
    type,
    title: ensureString(block.title),
    content: ensureString(block.content),
    code: ensureString(block.code),
    codeLanguage: ensureString(block.codeLanguage),
    duration: ensureString(block.duration),
    resources: blockResources,
    media,
  };
};

const buildFallbackProgram = (module, moduleId) => {
  const concepts = ensureArrayOfStrings(module?.keyConcepts?.fr);
  const blocks = concepts.map((concept, index) => ({
    id: `${moduleId}-fallback-${index}`,
    type: "lesson",
    title: concept,
    content: `- ${concept}`,
    code: "",
    codeLanguage: "",
    duration: "",
    resources: [],
    media: {
      type: "none",
      url: "",
      caption: "",
    },
  }));

  const activity = ensureString(module?.activities?.fr);
  if (activity) {
    blocks.push({
      id: `${moduleId}-fallback-activity`,
      type: "exercise",
      title: "Mise en pratique",
      content: activity,
      code: "",
      codeLanguage: "",
      duration: "",
      resources: [],
      media: {
        type: "none",
        url: "",
        caption: "",
      },
    });
  }

  const deliverable = ensureString(module?.deliverables?.fr);
  if (deliverable) {
    blocks.push({
      id: `${moduleId}-fallback-deliverable`,
      type: "tips",
      title: "Livrable attendu",
      content: deliverable,
      code: "",
      codeLanguage: "",
      duration: "",
      resources: [],
      media: {
        type: "none",
        url: "",
        caption: "",
      },
    });
  }

  const codeExample = module?.codeExample;
  if (codeExample?.content) {
    blocks.push({
      id: `${moduleId}-fallback-code`,
      type: "code",
      title: codeExample.title ?? "Exemple illustratif",
      content: "",
      code: ensureString(codeExample.content),
      codeLanguage: ensureString(codeExample.lang) || "html",
      duration: "",
      resources: [],
      media: {
        type: "none",
        url: "",
        caption: "",
      },
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      id: `${moduleId}-fallback-intro`,
      type: "lesson",
      title: "Nouvelle section",
      content: "",
      code: "",
      codeLanguage: "",
      duration: "",
      resources: [],
      media: {
        type: "none",
        url: "",
        caption: "",
      },
    });
  }

  return blocks;
};

const sanitizeProgram = (module, moduleId) => {
  const source = Array.isArray(module?.program) ? module.program : [];
  const sanitized = source
    .map((block, index) => sanitizeProgramBlock(block, index, moduleId))
    .filter(Boolean);

  if (sanitized.length > 0) {
    return sanitized;
  }

  return buildFallbackProgram(module, moduleId);
};

const sanitizeHistoryEntry = (entry, moduleId, index) => {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const snapshotSource = entry.snapshot ?? entry;
  const snapshot = sanitizeModule(snapshotSource, { forHistory: true });

  return {
    id: entry.id ?? `${moduleId}-rev-${index + 1}`,
    label: ensureString(entry.label) || `Version ${index + 1}`,
    updatedAt: entry.updatedAt ?? snapshot.updatedAt ?? new Date().toISOString(),
    snapshot,
  };
};

const sanitizeHistoryList = (entries, moduleId) => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry, index) => sanitizeHistoryEntry(entry, moduleId, index))
    .filter(Boolean)
    .slice(0, 5);
};

const extractNumericSuffix = (identifier) => {
  if (!identifier) {
    return null;
  }
  const matches = String(identifier).match(/(\d+)/g);
  if (!matches || !matches.length) {
    return null;
  }
  return Number.parseInt(matches[matches.length - 1], 10);
};

const generateModuleId = (collection) => {
  const existing = Array.isArray(collection) ? collection : [];
  const highest = existing.reduce((acc, module) => {
    const value = extractNumericSuffix(module.id);
    if (Number.isFinite(value) && value > acc) {
      return value;
    }
    return acc;
  }, 0);
  const nextNumber = highest + 1;
  return `J${nextNumber}`;
};

const rawDefaultModules = Array.isArray(modulesSource.modules)
  ? modulesSource.modules
  : [];

const sanitizeModule = (module, options = {}) => {
  if (!module || typeof module !== "object") {
    return module;
  }

  const nowISO = new Date().toISOString();
  const moduleId = module.id || randomId();
  const level = ensureString(module.level) || DEFAULT_LEVEL;
  const owner = ensureString(module.owner) || DEFAULT_OWNER;
  const status = ensureString(module.status) || DEFAULT_STATUS;

  const metadataSource = module.metadata && typeof module.metadata === "object"
    ? module.metadata
    : {};

  const createdAt = ensureString(module.createdAt)
    || ensureString(metadataSource.createdAt)
    || ensureString(module.updatedAt)
    || ensureString(metadataSource.updatedAt)
    || nowISO;

  const updatedAt = ensureString(module.updatedAt)
    || ensureString(metadataSource.updatedAt)
    || createdAt;

  const metadata = {
    createdAt,
    updatedAt,
    responsible: ensureString(metadataSource.responsible) || owner,
    status,
  };

  const history = options.forHistory
    ? []
    : options.trustHistory && Array.isArray(module.history)
      ? module.history.map((entry) => ({ ...entry }))
      : sanitizeHistoryList(module.history, moduleId);

  const baseModule = {
    ...module,
    id: moduleId,
    day: ensureString(module.day),
    duration: ensureString(module.duration),
    level,
    owner,
    status,
    title: ensureFieldObject(module.title),
    objectives: ensureFieldObject(module.objectives),
    content: ensureFieldObject(module.content),
    activities: ensureFieldObject(module.activities),
    deliverables: ensureFieldObject(module.deliverables),
    skills: ensureFieldObject(module.skills),
    keyConcepts: {
      fr: ensureArrayOfStrings(module.keyConcepts?.fr),
      en: ensureArrayOfStrings(module.keyConcepts?.en),
    },
    tags: ensureArrayOfStrings(module.tags),
    heroMedia: sanitizeHeroMedia(module.heroMedia),
    resources: sanitizeModuleResources(module.resources, moduleId),
    program: sanitizeProgram(module, moduleId),
    codeExample: sanitizeCodeExample(module.codeExample),
    history,
    metadata,
    updatedAt: metadata.updatedAt,
  };

  if (options.forHistory) {
    return baseModule;
  }

  return {
    ...baseModule,
    history,
  };
};

const sanitizeModules = (modules) =>
  Array.isArray(modules) ? modules.map(sanitizeModule) : [];

const fallbackModules = sanitizeModules(rawDefaultModules);

let hasWarnedMissingProvider = false;
const logMissingProviderWarning = () => {
  if (hasWarnedMissingProvider || typeof console === "undefined") {
    return;
  }
  hasWarnedMissingProvider = true;
  console.warn(
    "ModuleContentProvider n'est pas monté. Les modules affichés sont ceux par défaut et les modifications locales ne seront pas persistées.",
  );
};

const noop = () => {
  logMissingProviderWarning();
};

const noopReturnNull = () => {
  logMissingProviderWarning();
  return null;
};

const defaultContextValue = {
  modules: fallbackModules,
  updateModule: noop,
  resetModules: noop,
  createModule: noopReturnNull,
  duplicateModule: noopReturnNull,
  deleteModule: noop,
  restoreModuleVersion: noop,
};

const ModuleContentContext = createContext(defaultContextValue);

const loadInitialModules = () => {
  if (typeof window === "undefined") {
    return sanitizeModules(rawDefaultModules);
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return sanitizeModules(parsed);
      }
    }
  } catch (error) {
    console.error("Impossible de charger les modules personnalisés", error);
  }

  return sanitizeModules(rawDefaultModules);
};

export function ModuleContentProvider({ children }) {
  const [modules, setModules] = useState(loadInitialModules);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
    } catch (error) {
      console.error("Impossible d'enregistrer les modules", error);
    }
  }, [modules]);

  const resetModules = useCallback(() => {
    setModules(sanitizeModules(rawDefaultModules));
  }, []);

  const updateModule = useCallback(
    (moduleId, updater, options = {}) => {
      setModules((previous) => {
        let updated = false;

        const nextCollection = previous.map((module) => {
          if (module.id !== moduleId) {
            return module;
          }

          const current = sanitizeModule(module, { trustHistory: true });
          const draft =
            typeof updater === "function" ? updater(current) : updater;

          if (!draft || typeof draft !== "object") {
            return current;
          }

          const now = new Date();
          const nowISOString = now.toISOString();
          const historyDisabled = options.skipHistory === true;

          const existingHistory = Array.isArray(current.history)
            ? current.history
            : [];

          const historyEntry = historyDisabled
            ? null
            : {
              id: options.historyId ?? `${moduleId}-rev-${Date.now()}`,
              label:
                options.historyLabel
                ?? `Révision du ${now.toLocaleString("fr-FR")}`,
              updatedAt: nowISOString,
              snapshot: sanitizeModule(current, { forHistory: true }),
            };

          const history = historyEntry
            ? [historyEntry, ...existingHistory].slice(0, 5)
            : existingHistory;

          const mergedModule = {
            ...current,
            ...draft,
            metadata: {
              ...(current.metadata ?? {}),
              ...(draft.metadata ?? {}),
              status: draft.status ?? current.status,
              responsible: draft.owner ?? current.owner ?? DEFAULT_OWNER,
              updatedAt: nowISOString,
            },
            updatedAt: nowISOString,
            history,
          };

          updated = true;
          return sanitizeModule(mergedModule, { trustHistory: true });
        });

        return updated ? nextCollection : previous;
      });
    },
    [],
  );

  const createModule = useCallback((overrides = {}) => {
    let createdModuleId = overrides.id ?? null;
    setModules((previous) => {
      const identifier = overrides.id ?? generateModuleId(previous);
      createdModuleId = identifier;

      const now = new Date().toISOString();
      const draftModule = {
        ...overrides,
        id: identifier,
        title: overrides.title ?? { fr: "Nouveau module", en: "" },
        objectives: overrides.objectives ?? { fr: "", en: "" },
        content: overrides.content ?? { fr: "", en: "" },
        activities: overrides.activities ?? { fr: "", en: "" },
        deliverables: overrides.deliverables ?? { fr: "", en: "" },
        skills: overrides.skills ?? { fr: "", en: "" },
        status: overrides.status ?? DEFAULT_STATUS,
        owner: overrides.owner ?? DEFAULT_OWNER,
        level: overrides.level ?? DEFAULT_LEVEL,
        metadata: {
          ...(overrides.metadata ?? {}),
          createdAt: overrides.metadata?.createdAt ?? now,
          updatedAt: overrides.metadata?.updatedAt ?? now,
          responsible: overrides.owner ?? DEFAULT_OWNER,
          status: overrides.status ?? DEFAULT_STATUS,
        },
        history: [],
      };

      const sanitizedNewModule = sanitizeModule(draftModule, { trustHistory: true });
      return [...previous, sanitizedNewModule];
    });

    return createdModuleId;
  }, []);

  const duplicateModule = useCallback(
    (moduleId) => {
      let duplicatedModuleId = null;

      setModules((previous) => {
        const baseModule = previous.find((entry) => entry.id === moduleId);
        if (!baseModule) {
          return previous;
        }

        const identifier = generateModuleId(previous);
        duplicatedModuleId = identifier;

        const sanitizedBase = sanitizeModule(baseModule, { trustHistory: true });
        const now = new Date().toISOString();
        const duplicate = sanitizeModule(
          {
            ...sanitizedBase,
            id: identifier,
            day: sanitizedBase.day ? `${sanitizedBase.day} bis` : "",
            title: {
              fr: sanitizedBase.title?.fr
                ? `${sanitizedBase.title.fr} (copie)`
                : `Module ${identifier}`,
              en: sanitizedBase.title?.en ?? "",
            },
            status: DEFAULT_STATUS,
            owner: sanitizedBase.owner ?? DEFAULT_OWNER,
            metadata: {
              ...(sanitizedBase.metadata ?? {}),
              createdAt: now,
              updatedAt: now,
              responsible: sanitizedBase.owner ?? DEFAULT_OWNER,
              status: DEFAULT_STATUS,
            },
            history: [],
          },
          { trustHistory: true },
        );

        return [...previous, duplicate];
      });

      return duplicatedModuleId;
    },
    [],
  );

  const deleteModule = useCallback((moduleId) => {
    setModules((previous) => previous.filter((module) => module.id !== moduleId));
  }, []);

  const restoreModuleVersion = useCallback((moduleId, historyId) => {
    setModules((previous) =>
      previous.map((module) => {
        if (module.id !== moduleId) {
          return module;
        }

        const historyEntries = Array.isArray(module.history) ? module.history : [];
        const versionEntry = historyEntries.find((entry) => entry.id === historyId);

        if (!versionEntry) {
          return module;
        }

        const now = new Date();
        const nowISOString = now.toISOString();

        const snapshotCurrent = sanitizeModule(module, { forHistory: true });
        const withoutTarget = historyEntries.filter((entry) => entry.id !== historyId);

        const updatedHistory = [
          {
            id: `${moduleId}-rev-${Date.now()}`,
            label: `Avant restauration (${now.toLocaleTimeString("fr-FR")})`,
            updatedAt: nowISOString,
            snapshot: snapshotCurrent,
          },
          ...withoutTarget,
        ].slice(0, 5);

        return sanitizeModule(
          {
            ...versionEntry.snapshot,
            id: moduleId,
            history: updatedHistory,
            metadata: {
              ...(versionEntry.snapshot?.metadata ?? {}),
              updatedAt: nowISOString,
              responsible: versionEntry.snapshot?.owner ?? DEFAULT_OWNER,
            },
            updatedAt: nowISOString,
          },
          { trustHistory: true },
        );
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      modules,
      updateModule,
      resetModules,
      createModule,
      duplicateModule,
      deleteModule,
      restoreModuleVersion,
    }),
    [
      modules,
      updateModule,
      resetModules,
      createModule,
      duplicateModule,
      deleteModule,
      restoreModuleVersion,
    ],
  );

  return (
    <ModuleContentContext.Provider value={value}>
      {children}
    </ModuleContentContext.Provider>
  );
}

export function useModuleContent() {
  const context = useContext(ModuleContentContext);
  if (context === defaultContextValue) {
    logMissingProviderWarning();
  }
  return context;
}
