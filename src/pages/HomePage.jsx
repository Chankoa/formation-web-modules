import IntroCard from "../components/IntroCard";
import ExplorerShowcase from "../components/ExplorerShowcase";
import ModuleSection from "../components/ModuleSection";
import InfoGrid from "../components/InfoGrid";
import ContactSection from "../components/ContactSection";
import { formationModules } from "../data/formation";

export default function HomePage() {
  return (
    <main className="container main-content">
      <IntroCard />
      <ExplorerShowcase />
      <ModuleSection modules={formationModules} />
      <InfoGrid />
      <ContactSection />
    </main>
  );
}
