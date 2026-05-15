import { useState } from "react";
import { Link } from "react-router-dom";

const MOCK_TERMS = [
  {
    id: 1,
    term: "Tabungan",
    category: "Rekening",
    desc: "Simpanan uang di bank yang penarikannya hanya dapat dilakukan menurut syarat tertentu yang disepakati.",
    icon: "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
  {
    id: 2,
    term: "Transfer",
    category: "Transaksi",
    desc: "Kirim uang yang diterima bank termasuk hasil inkaso yang ditagih melalui bank, yang harus dibayarkan kepada penerima.",
    icon: "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
  {
    id: 3,
    term: "Deposito",
    category: "Investasi",
    desc: "Simpanan yang pencairannya hanya dapat dilakukan pada jangka waktu tertentu dan syarat-syarat tertentu.",
    icon: "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
  {
    id: 4,
    term: "Bunga Bank",
    category: "Bunga",
    desc: "Imbal jasa atas pinjaman uang atau simpanan yang dibayarkan oleh debitur kepada kreditur atau sebaliknya.",
    icon: "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
  {
    id: 5,
    term: "Rekening Koran",
    category: "Rekening",
    desc: "Daftar mutasi rekening nasabah yang dikeluarkan bank secara berkala untuk mencatat transaksi masuk dan keluar.",
    icon: "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
  {
    id: 6,
    term: "Kartu Debit",
    category: "Keamanan",
    desc: "Alat pembayaran non-tunai yang menggunakan kartu plastik dan PIN untuk transaksi di mesin ATM atau EDC.",
    icon: "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
];

const CATEGORIES = [
  "Semua Istilah",
  "Rekening",
  "Transaksi",
  "Investasi",
  "Bunga",
  "Keamanan",
];

function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua Istilah");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredTerms = MOCK_TERMS.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "Semua Istilah" || item.category === activeCategory;
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
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setVisibleCount(6);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? "bg-blue-700 text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {displayedTerms.length > 0 ? (
              displayedTerms.map((term) => (
                <div
                  key={term.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="h-44 bg-gray-100 flex items-center justify-center text-4xl relative">
                    <img src={term.icon} alt={term.term} />
                    
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
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {term.term}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {term.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {term.desc}
                    </p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <button className="text-blue-700 font-semibold text-sm hover:underline flex items-center gap-1">
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
                      </button>
                      <button
                        className="text-gray-400 hover:text-blue-700 transition-colors"
                        title="Simpan"
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
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
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
        </div>
      </main>
    </div>
  );
}

export default GlossaryPage;
