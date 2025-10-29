import ModuleCard from "./ModuleCard";

export default function ModuleSection({ modules }) {
  return (
    <section className="module-section" id="modules">
      <header className="section-header">
        <h2>Modules, cours & chapitres</h2>
        <p>
          10 journées progressives : du cadrage stratégique à la mise en ligne
          d’un site, avec des livrables concrets et des compétences ciblées.
        </p>
      </header>
      <div className="module-grid">
        {modules.map((item) => (
          <ModuleCard key={item.id} data={item} />
        ))}
      </div>
    </section>
  );
}
