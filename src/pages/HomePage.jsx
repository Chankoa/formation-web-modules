import { Link } from "react-router-dom";
import ExplorerShowcase from "../components/ExplorerShowcase";
import InfoGrid from "../components/InfoGrid";
import ContactSection from "../components/ContactSection";
import { formationModules } from "../data/formation";

const heroHighlights = [
  "Accompagnement pas-à-pas",
  "Mises en pratique quotidiennes et livrables concrets",
  "Ressources pour accélérer vos projets",
];

const heroStats = [
  {
    label: "Sessions",
    value: "10 journées",
    helper: "Du cadrage à la mise en ligne",
  },
  {
    label: "Rythme",
    value: "7 h / jour",
    helper: "3 h théorie · 4 h pratique",
  },
  {
    label: "Projet",
    value: "Livrable final",
    helper: "Portfolio & restitution",
  },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="home-hero">
        <div className="container home-hero__inner">
          <p className="home-hero__eyebrow">Création web</p>
          <h1>Une formation intensive pour lancer vos projets web avec confiance.</h1>
          <p className="home-hero__intro">
            Pendant 10 journées guidées, structurez votre démarche, concevez des interfaces convaincantes
            et livrez un site professionnel. Chaque module combine concepts clés, coaching et mise en pratique
            pour progresser avec confiance.
          </p>
          <ul className="home-hero__highlights">
            {heroHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="home-hero__actions">
            <Link className="btn" to="/dashboard">
              Accéder au dashboard
            </Link>
            <a className="btn btn-secondary" href="#modules">
              Explorer les modules
            </a>
          </div>
          <div className="home-hero__meta">
            {heroStats.map((stat) => (
              <div key={stat.label} className="home-hero__stat">
                <span className="home-hero__stat-label">{stat.label}</span>
                <span className="home-hero__stat-value">{stat.value}</span>
                <span className="home-hero__stat-helper">{stat.helper}</span>
              </div>
            ))}
          </div>
        </div>
      </header>
      <section className="home-section" id="modules">
        <div className="container home-section__inner">
          <div className="home-section__header">
            <h2>Le programme jour après jour</h2>
            <p>
              Des modules courts et progressifs pour maîtriser les fondamentaux, pratiquer immédiatement
              et capitaliser sur vos livrables.
            </p>
          </div>
          <ul className="home-modules">
            {formationModules.map((module) => (
              <li key={module.id} className="home-modules__item">
                <div className="home-modules__index">{String(module.order).padStart(2, "0")}</div>
                <div className="home-modules__content">
                  <p className="home-modules__meta">
                    <span>Jour {module.order}</span>
                    <span>Durée 7 h</span>
                  </p>
                  <h3>{module.module}</h3>
                  <p>{module.theme}</p>
                  <p className="home-modules__helper">{module.skills}</p>
                </div>
                <Link className="home-modules__cta" to={`/modules/${module.id.toLowerCase()}`}>
                  Découvrir →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="home-section home-section--alt" id="supports">
        <div className="container home-section__inner">
          <div className="home-section__header">
            <h2>Supports & moments clés</h2>
            <p>Des repères concrets pour rythmer vos ateliers et nourrir vos sessions de pratique.</p>
          </div>
          <InfoGrid />
        </div>
      </section>

      <section className="home-section" id="exploration">
        <div className="container home-section__inner">
          <div className="home-section__header">
            <h2>Explorer le terrain</h2>
            <p>Des inspirations et cas pratiques pour élargir votre culture produit et design.</p>
          </div>
          <ExplorerShowcase />
        </div>
      </section>

      <section className="home-section" id="contact">
        <div className="container home-section__inner">
          <ContactSection />
        </div>
      </section>
    </main>
  );
}
