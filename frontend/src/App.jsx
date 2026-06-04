import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/LandingPage';
import TranslatorPage from './pages/TranslatorPage';
import GlossaryPage from './pages/GlossaryPage';
import TeamPage from './pages/TeamPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminGlossaryPage from './pages/AdminGlossaryPage';
import AdminCategoryPage from './pages/AdminCategoryPage';
import GlossaryDetailPage from './pages/GlossaryDetailPage';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes with Navbar */}
          <Route path="/" element={<><Navbar /><LandingPage /></>} />
          <Route path="/translator" element={<><Navbar /><TranslatorPage /></>} />
          <Route path="/glossary" element={<><Navbar /><GlossaryPage /></>} />
          <Route path="/glossary/:id" element={<><Navbar /><GlossaryDetailPage /></>} />
          <Route path="/team" element={<><Navbar /><TeamPage /></>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboardPage />} />
            <Route path="glosarium" element={<AdminGlossaryPage />} />
            <Route path="categories" element={<AdminCategoryPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;