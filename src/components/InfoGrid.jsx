export default function InfoGrid() {
  return (
    <section className="info-grid">
      <article className="note padded rounded-sm" aria-labelledby="note-title">
        <h3 id="note-title">À retenir</h3>
        <p>
          Un site réussi repose sur une vision claire, une structure solide et
          un contenu cohérent. Chaque module consolide les fondamentaux et ouvre
          sur la pratique.
        </p>
      </article>

      <article className="exercise padded rounded-sm" aria-labelledby="exercise-title">
        <h3 id="exercise-title">🧩 Exercice fil rouge</h3>
        <ol>
          <li>Choisir un projet web à prototyper pendant la formation.</li>
          <li>Documenter supports, inspirations, contraintes et objectifs.</li>
          <li>Présenter chaque fin de journée une synthèse des acquis.</li>
        </ol>
      </article>
    </section>
  );
}
