import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ModulePage from "./pages/ModulePage";
// import "./styles/main.scss";
import "./styles/build/main.css";
import brandLogo from "./assets/react.svg";

function App() {
  return (
    <div className="app">
      <Header logoSrc={brandLogo} logoAlt="Formation Création Web" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/modules/:moduleId" element={<ModulePage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
