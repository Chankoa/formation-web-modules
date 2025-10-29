import IntroCard from "../components/IntroCard";
import ExplorerShowcase from "../components/ExplorerShowcase";
import ModuleSection from "../components/ModuleSection";
import InfoGrid from "../components/InfoGrid";
import ContactSection from "../components/ContactSection";
import { formationModules } from "../data/formation";

export default function HomePage() {
  return (
    <main className="main-content">
      <header className="module-hero">
        <div className="container">
        <IntroCard />
        </div>
      </header>
      <div className="container">
        <ModuleSection modules={formationModules} />
        <InfoGrid />
        <ExplorerShowcase />
        <ContactSection />
      </div>
    </main>
  );
}
