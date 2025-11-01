/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import modulesSource from "../data/modules-formation-web.json";

const STORAGE_KEY = "formation-web-modules-content";

const rawDefaultModules = Array.isArray(modulesSource.modules)
  ? modulesSource.modules
  : [];

const sanitizeModule = (module) => {
  if (!module || typeof module !== "object") {
    return module;
  }
  const ensureField = (value) =>
    value && typeof value === "object" ? value : { fr: "", en: "" };

  return {
    ...module,
    day: module.day ?? "",
    title: ensureField(module.title),
    objectives: ensureField(module.objectives),
    content: ensureField(module.content),
    activities: ensureField(module.activities),
    deliverables: ensureField(module.deliverables),
    skills: ensureField(module.skills),
    keyConcepts: {
      fr: Array.isArray(module.keyConcepts?.fr)
        ? module.keyConcepts.fr
        : [],
      en: Array.isArray(module.keyConcepts?.en)
        ? module.keyConcepts.en
        : [],
    },
    tags: Array.isArray(module.tags) ? module.tags : [],
    resources: Array.isArray(module.resources) ? module.resources : [],
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

const defaultContextValue = {
  modules: fallbackModules,
  updateModule: noop,
  resetModules: noop,
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

  const updateModule = (moduleId, updater) => {
    setModules((previous) =>
      previous.map((module) => {
        if (module.id !== moduleId) {
          return module;
        }
        const nextValue =
          typeof updater === "function" ? updater(module) : updater;
        return sanitizeModule({ ...module, ...nextValue });
      }),
    );
  };

  const resetModules = () => {
    setModules(sanitizeModules(rawDefaultModules));
  };

  const value = useMemo(
    () => ({
      modules,
      updateModule,
      resetModules,
    }),
    [modules],
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
