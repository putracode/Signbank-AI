import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function GlossaryPage() {
  const [terms, setTerms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua Istilah");
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms();
    fetchCategories();
  }, []);

  const fetchTerms = async () => {
    try {
      const { data } = await api.get("/glosarium");
      setTerms(data.data.glosariums);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data.categories);
    } catch (err) {
      console.error("Gagal mengambil data kategori:", err);
    }
  };

  const filteredTerms = terms.filter((item) => {
    const matchesSearch =
      item.termName.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "Semua Istilah" || item.categoryName === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedTerms = filteredTerms.slice(0, visibleCount);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col p-6 sticky top-0 h-screen">
        <nav className="space-y-2 flex-1">
          <Link
            to="/translator"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
            Penerjemah
          </Link>
          <div className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium flex items-center gap-3 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Glosarium
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-700">
            SignBank AI
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Literasi Keuangan
            </h1>
            <p className="text-gray-600 mb-6 max-w-2xl">
              Kuasai terminologi perbankan dengan panduan bahasa isyarat visual
              berkualitas tinggi yang dirancang khusus untuk komunitas Tuli.
            </p>

            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Cari istilah (misal: Tabungan)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => {
                setActiveCategory("Semua Istilah");
                setVisibleCount(6);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === "Semua Istilah"
                  ? "bg-blue-700 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Semua Istilah
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setVisibleCount(6);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.name
                    ? "bg-blue-700 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Memuat data glosarium...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {displayedTerms.length > 0 ? (
                displayedTerms.map((term) => (
                  <div
                    key={term.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="h-44 bg-gray-100 flex items-center justify-center text-4xl relative overflow-hidden">
                      {term.thumbnailUrl ? (
                        <img 
                          src={`http://localhost:3000${term.thumbnailUrl}`} 
                          alt={term.termName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Pratinjau
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/glossary/${term.id}`}>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {term.termName}
                          </h3>
                        </Link>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {term.categoryName || "Umum"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {term.description}
                      </p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <Link 
                          to={`/glossary/${term.id}`}
                          className="text-blue-700 font-semibold text-sm hover:underline flex items-center gap-1"
                        >
                          Lihat Detail
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p className="text-lg">Tidak ada istilah yang ditemukan.</p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("Semua Istilah");
                    }}
                    className="mt-2 text-blue-700 hover:underline"
                  >
                    Atur Ulang Filter
                  </button>
                </div>
              )}
            </div>
          )}

          {!loading && (
            <div className="text-center border-t border-gray-200 pt-8">
              <p className="text-gray-500 text-sm mb-4">
                Menampilkan{" "}
                <span className="font-semibold text-gray-800">
                  {displayedTerms.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-800">
                  {filteredTerms.length}
                </span>{" "}
                istilah di Database
              </p>
              {displayedTerms.length < filteredTerms.length && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors shadow-sm"
                >
                  Muat Lebih Banyak
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GlossaryPage;
