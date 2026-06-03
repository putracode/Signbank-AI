import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { API_URL } from "../services/api";

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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 border border-gray-300">
              {displayedTerms.length > 0 ? (
                displayedTerms.map((term) => (
                  <div
                    key={term.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="h-44 bg-gray-100 flex items-center justify-center text-4xl relative overflow-hidden">
                      {term.thumbnailUrl ? (
                        <img 
                          src={`${API_URL}${term.thumbnailUrl}`} 
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
