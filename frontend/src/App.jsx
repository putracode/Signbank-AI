import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/LandingPage';
import TranslatorPage from './pages/TranslatorPage';
import GlossaryPage from './pages/GlossaryPage';
import TeamPage from './pages/TeamPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/translator" element={<TranslatorPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/team" element={<TeamPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;