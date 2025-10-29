import { formationOverview } from "../data/formation";

export default function IntroCard() {
  const { title, subtitle, duration, audience, coreObjectives, methodology } =
    formationOverview;

  return (
    <section className="intro-card" id="intro">
      <h2>{title}</h2>
      <p className="subtitle">{subtitle}</p>
      <div className="intro-card__grid">
        <dl className="intro-card__details">
          <div>
            <dt>Durée</dt>
            <dd>{duration}</dd>
          </div>
          <div>
            <dt>Public</dt>
            <dd>{audience}</dd>
          </div>
          <div>
            <dt>Méthodologie</dt>
            <dd>{methodology}</dd>
          </div>
        </dl>
        <div>
          <h3 className="intro-card__title">Objectifs clés</h3>
          <ul className="bullets">
            {coreObjectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
