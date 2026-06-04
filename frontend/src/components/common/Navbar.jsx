import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png"

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path
      ? "text-blue-700 font-semibold border-b-2 border-blue-700"
      : "text-gray-600 hover:text-blue-700";
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-700 tracking-tight flex items-center gap-2">
              <img src={logo} alt="logo" className="w-12 h-12 object-contain" />
              SignBank
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${isActive("/")} transition-colors py-1`}>
              Beranda
            </Link>
            <Link
              to="/translator"
              className={`${isActive("/translator")} transition-colors py-1`}
            >
              Penerjemah
            </Link>
            <Link
              to="/glossary"
              className={`${isActive("/glossary")} transition-colors py-1`}
            >
              Glosarium
            </Link>
            <Link
              to="/team"
              className={`${isActive("/team")} transition-colors py-1`}
            >
              Tim
            </Link>
            <Link
              to="/admin/login"
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg transition-colors ml-4 shadow-sm"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-50 transition-colors focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white" id="mobile-menu">
          <div className="px-3 pt-2 pb-4 space-y-1 flex flex-col">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-base font-medium transition-all ${
                location.pathname === "/"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/translator"
              onClick={() => setIsOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-base font-medium transition-all ${
                location.pathname === "/translator"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              Penerjemah
            </Link>
            <Link
              to="/glossary"
              onClick={() => setIsOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-base font-medium transition-all ${
                location.pathname === "/glossary"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              Glosarium
            </Link>
            <Link
              to="/team"
              onClick={() => setIsOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-base font-medium transition-all ${
                location.pathname === "/team"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              Tim
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="mt-4 mx-4 bg-blue-700 hover:bg-blue-800 text-white text-center font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Login Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
