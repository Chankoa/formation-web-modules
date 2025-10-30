import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ModulePage from "./pages/ModulePage";
import DashboardPage from "./pages/DashboardPage";
import ScrollToTop from "./components/ScrollToTop";
// import "./styles/main.scss";
import "./styles/build/main.css";
import brandLogo from "./assets/learnit-logo.svg";

function App() {
  return (
    <div className="app">
      <ScrollToTop />
  <Header logoSrc={brandLogo} logoAlt="Formation Création Web" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/modules/:moduleId" element={<ModulePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
