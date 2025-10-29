import { Link } from "react-router-dom";

export default function ModuleCard({ data }) {
  const { id, module: moduleTitle, theme, objectives, chapters, order } = data;

  return (
    <article className="module-card card" id={id.toLowerCase()}>
      <Link
        className="module-card__link"
        to={`/modules/${id.toLowerCase()}`}
        aria-label={`Découvrir le module ${moduleTitle}`}
      />
      <header className="module-card__header">
        <span className="module-card__badge">Jour {order}</span>
        <div>
          <h3>{moduleTitle}</h3>
          <p className="module-card__theme">{theme}</p>
        </div>
      </header>

      <div className="module-card__body">
        <h4>Objectifs pédagogiques</h4>
        <ul className="bullets">
          {objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </div>

      <dl className="module-card__chapters">
        {chapters.map((chapter) => (
          <div key={chapter.title} className="module-card__chapter">
            <dt>{chapter.title}</dt>
            <dd>
              <ul className="stacked-list">
                {chapter.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
      <div className="module-card__cta">
        <span>Voir le module</span>
        <span aria-hidden="true">→</span>
      </div>
    </article>
  );
}
