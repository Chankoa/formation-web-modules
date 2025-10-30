import { Link } from "react-router-dom";
import modulesData from "../data/modules-formation-web.json";

const modules = modulesData.modules ?? [];

export default function DashboardPage() {
  const upcomingModule = modules.length > 1 ? modules[1] : modules[0];
  const focusModule = modules[0];
  const highlightedModules = modules.slice(0, 4);

  const stats = [
    {
      id: "progress",
      label: "Modules complétés",
      value: "3 / 10",
      helper: upcomingModule
        ? `Prochaine étape : ${upcomingModule.title.fr}`
        : "Programmez votre prochaine session.",
    },
    {
      id: "time",
      label: "Temps de formation",
      value: "21 h suivies",
      helper: "Objectif hebdomadaire : 28 h",
    },
    {
      id: "practice",
      label: "Heures de pratique",
      value: "9 h",
      helper: focusModule
        ? `Focus actuel : ${focusModule.title.fr}`
        : "Choisissez un module à approfondir.",
    },
  ];

  const actionCards = [
    {
      id: "plan",
      title: "Planifier ma prochaine session",
      description: "Réservez un créneau de 2 h pour consolider vos acquis.",
      ctaLabel: "Planifier",
      ctaHref: "#planification",
    },
    {
      id: "notes",
      title: "Mettre à jour mes notes",
      description: "Consignez vos retours d’expérience module par module.",
      ctaLabel: "Ouvrir mes notes",
      ctaHref: "#notes",
    },
    {
      id: "ressources",
      title: "Explorer les ressources clés",
      description: upcomingModule
        ? `Préparez-vous avec les supports du module ${upcomingModule.title.fr}.`
        : "Sélectionnez un module pour découvrir ses ressources.",
      ctaLabel: "Voir les supports",
      ctaTo: upcomingModule
        ? `/modules/${upcomingModule.id.toLowerCase()}#supports`
        : "/#supports",
    },
  ];

  return (
    <main className="dashboard-page">
      <header className="dashboard-hero">
        <div className="container dashboard-hero__inner">
          <p className="dashboard-hero__eyebrow">Votre progression</p>
          <h1>Tableau de bord</h1>
          <p className="dashboard-hero__intro">
            Centralisez vos objectifs, vos modules et vos ressources pour rester dans le rythme de la formation.
          </p>

          <div className="dashboard-hero__meta">
            <div className="dashboard-hero__stat">
              <span className="dashboard-hero__stat-label">Session en cours</span>
              <span className="dashboard-hero__stat-value">
                {upcomingModule ? upcomingModule.title.fr : "À planifier"}
              </span>
            </div>
            <div className="dashboard-hero__stat">
              <span className="dashboard-hero__stat-label">Prochaine livraison</span>
              <span className="dashboard-hero__stat-value">Vendredi 18:00</span>
            </div>
            <div className="dashboard-hero__stat">
              <span className="dashboard-hero__stat-label">Rythme visé</span>
              <span className="dashboard-hero__stat-value">4 sessions / semaine</span>
            </div>
          </div>

          <div className="dashboard-hero__actions">
            {upcomingModule ? (
              <Link
                className="btn"
                to={`/modules/${upcomingModule.id.toLowerCase()}`}
              >
                Reprendre le module
              </Link>
            ) : null}
            <a className="btn btn-secondary" href="#actions">
              Voir mes actions
            </a>
          </div>
        </div>
      </header>

      <section className="dashboard-section">
        <div className="container">
          <div className="dashboard-grid">
            {stats.map((stat) => (
              <article key={stat.id} className="dashboard-card card">
                <span className="dashboard-card__label">{stat.label}</span>
                <strong className="dashboard-card__value">{stat.value}</strong>
                <p className="dashboard-card__helper">{stat.helper}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-section" id="actions">
        <div className="container dashboard-section__inner">
          <div className="dashboard-section__header">
            <h2>Actions rapides</h2>
            <p>Maintenez votre dynamique d’apprentissage avec ces trois priorités.</p>
          </div>
          <div className="dashboard-actions">
            {actionCards.map((action) => (
              <article key={action.id} className="dashboard-action card">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                {action.ctaTo ? (
                  <Link className="dashboard-action__link" to={action.ctaTo}>
                    {action.ctaLabel}
                  </Link>
                ) : (
                  <a className="dashboard-action__link" href={action.ctaHref}>
                    {action.ctaLabel}
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-section dashboard-section--alt">
        <div className="container dashboard-section__inner">
          <div className="dashboard-section__header">
            <h2>Parcours du moment</h2>
            <p>Anticipez les prochaines étapes et préparez vos supports à venir.</p>
          </div>
          <ul className="dashboard-timeline">
            {highlightedModules.map((module, index) => (
              <li key={module.id} className="dashboard-timeline__item">
                <span className="dashboard-timeline__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="dashboard-timeline__content">
                  <h3>{module.title.fr}</h3>
                  <p>{module.objectives.fr}</p>
                  <Link
                    className="dashboard-timeline__link"
                    to={`/modules/${module.id.toLowerCase()}`}
                  >
                    Ouvrir le module →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
