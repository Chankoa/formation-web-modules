export const formationOverview = {
  title: "Formation Création Web",
  subtitle: "Parcours modulaire – 10 jours",
  duration: "10 jours (70h)",
  audience: "Débutants souhaitant structurer un projet web",
  coreObjectives: [
    "Comprendre la logique d'un projet web et ses métiers",
    "Acquérir des bases solides en HTML, CSS et responsive design",
    "Découvrir l'intégration d'un CMS et les bonnes pratiques de performance",
  ],
  methodology: "Progression du cadrage stratégique jusqu'à la mise en ligne, avec mise en pratique quotidienne.",
};

const rawModules = [
  {
    id: "J1",
    module: "Introduction",
    theme: "Les étapes d’un projet web",
    objectives: [
      "Comprendre la logique projet",
      "Identifier les métiers du web",
      "Adopter une démarche éco-responsable",
    ],
    supports: ["PDF 01", "Explorateur HTML/CSS"],
    practical: "Analyse de sites inspirants",
    tools: ["Firefox", "VS Code"],
    skills:
      "Identifier les composantes d’un projet web et les principaux métiers associés.",
  },
  {
    id: "J2",
    module: "HTML & Structure",
    theme: "Bases du HTML5 sémantique",
    objectives: ["Créer une page structurée avec des balises sémantiques"],
    supports: ["PDF 03", "Portfolio HTML"],
    practical: "Création d’une structure HTML simple",
    tools: ["VS Code", "GitHub"],
    skills:
      "Structurer une page web en respectant la sémantique HTML5 et les standards du W3C.",
  },
  {
    id: "J3",
    module: "HTML/CSS",
    theme: "Mise en forme et typographie",
    objectives: ["Styliser le texte et les sections d’une page"],
    supports: ["PDF 06", "Portfolio CSS"],
    practical: "Application de couleurs et typographies",
    tools: ["Google Fonts"],
    skills:
      "Appliquer les règles de mise en forme et de typographie avec CSS.",
  },
  {
    id: "J4",
    module: "CSS Layout",
    theme: "Modèle de boîte et positionnement",
    objectives: ["Organiser les blocs avec Flexbox et Grid"],
    supports: ["PDF 07", "PDF 08", "Maquette CSS"],
    practical: "Mise en page responsive simple",
    tools: ["VS Code", "CodePen"],
    skills:
      "Construire une mise en page responsive à l’aide du modèle de boîte, Flexbox et Grid.",
  },
  {
    id: "J5",
    module: "Responsive Design",
    theme: "Adaptation multi-écrans",
    objectives: ["Appliquer les media queries et définir des breakpoints"],
    supports: ["PDF 09"],
    practical: "Vérification et correction responsive",
    tools: ["Chrome DevTools"],
    skills:
      "Adapter une interface à différents écrans via les media queries et les bonnes pratiques RWD.",
  },
  {
    id: "J6",
    module: "UX / UI Design",
    theme: "Ergonomie et parcours utilisateur",
    objectives: ["Concevoir une interface claire et cohérente"],
    supports: ["PDF 02"],
    practical: "Wireframe et zoning",
    tools: ["Figma", "Miro"],
    skills:
      "Concevoir une interface centrée utilisateur intégrant ergonomie et parcours de navigation.",
  },
  {
    id: "J7",
    module: "Éco-conception",
    theme: "Performance et durabilité",
    objectives: ["Identifier les bonnes pratiques Green IT"],
    supports: ["PDF Éco", "Doc 14"],
    practical: "Optimisation d’un mini-site",
    tools: ["Lighthouse"],
    skills:
      "Mettre en œuvre les principes d’éco-conception pour réduire l’impact environnemental d’un site.",
  },
  {
    id: "J8",
    module: "CMS WordPress (1)",
    theme: "Installation et découverte",
    objectives: ["Installer WordPress en local et créer des pages"],
    supports: ["PDF WP01", "PDF WP02"],
    practical: "Installation locale et configuration",
    tools: ["Local WP"],
    skills:
      "Installer et configurer un CMS WordPress en environnement local.",
  },
  {
    id: "J9",
    module: "CMS WordPress (2)",
    theme: "Personnalisation et blocs",
    objectives: ["Personnaliser le thème Kadence"],
    supports: ["PDF WP03", "Kadence Demo"],
    practical: "Customisation et création de menu",
    tools: ["WP Admin"],
    skills:
      "Personnaliser un site WordPress (thèmes, blocs, extensions) pour répondre à un cahier des charges.",
  },
  {
    id: "J10",
    module: "CMS WordPress (3)",
    theme: "SEO et mise en ligne",
    objectives: ["Optimiser le référencement et la performance"],
    supports: ["PDF WP04", "Netlify Doc"],
    practical: "Préparation à la mise en ligne",
    tools: ["RankMath", "Netlify"],
    skills:
      "Préparer la mise en ligne et optimiser le référencement naturel (SEO) d’un site web.",
  },
];

export const formationModules = rawModules.map((item, index) => ({
  ...item,
  order: index + 1,
  chapters: [
    {
      title: "Supports",
      items: item.supports,
    },
    {
      title: "Travaux pratiques",
      items: [item.practical],
    },
    {
      title: "Outils / Ressources",
      items: item.tools,
    },
    {
      title: "Compétences visées",
      items: [item.skills],
    },
  ],
}));

export default formationModules;
