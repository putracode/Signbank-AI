import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path
      ? "text-blue-700 font-semibold border-b-2 border-blue-700"
      : "text-gray-600 hover:text-blue-700";
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-700">
              Signbank
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link to="/" className={`${isActive("/")} transition-colors`}>
              Beranda
            </Link>
            <Link
              to="/translator"
              className={`${isActive("/translator")} transition-colors`}
            >
              Penerjemah
            </Link>
            <Link
              to="/team"
              className={`${isActive("/team")} transition-colors`}
            >
              Tim
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
