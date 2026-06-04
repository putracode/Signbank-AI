import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalTerms: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentTerms, setRecentTerms] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [glossaryRes, categoryRes] = await Promise.all([
        api.get("/glosarium"),
        api.get("/categories"),
      ]);

      const glosariums = glossaryRes.data.data.glosariums || [];
      const categories = categoryRes.data.data.categories || [];

      setStats({
        totalTerms: glosariums.length,
        totalCategories: categories.length,
      });

      // Ambil 5 istilah terbaru
      const sorted = [...glosariums].reverse().slice(0, 5);
      setRecentTerms(sorted);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 transform translate-x-12 -translate-y-12 opacity-10">
          <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
          </svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">Selamat Datang di Panel Admin</h2>
          <p className="text-blue-100 max-w-xl text-lg font-medium">
            Kelola istilah glosarium keuangan isyarat Anda dengan cepat dan mudah.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Istilah */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Istilah</p>
                <h3 className="text-4xl font-extrabold text-blue-700 mt-2">{stats.totalTerms}</h3>
                <p className="text-xs text-gray-400 mt-2">Istilah isyarat terdaftar</p>
              </div>
              <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            {/* Total Kategori */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Kategori</p>
                <h3 className="text-4xl font-extrabold text-indigo-700 mt-2">{stats.totalCategories}</h3>
                <p className="text-xs text-gray-400 mt-2">Kategori glosarium aktif</p>
              </div>
              <div className="p-4 bg-indigo-50 text-indigo-700 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01M15 7h.01M15 11h.01M15 15h.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Terms */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Istilah Terbaru</h3>
              <div className="divide-y divide-gray-100">
                {recentTerms.map((term) => (
                  <div key={term.id} className="py-3 flex justify-between items-center hover:bg-gray-50/50 rounded-xl px-2 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-800">{term.termName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{term.categoryName || "Tanpa Kategori"}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                      Baru
                    </span>
                  </div>
                ))}
                {recentTerms.length === 0 && (
                  <p className="text-center py-8 text-gray-400 text-sm">Belum ada istilah yang ditambahkan.</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Akses Cepat</h3>
                <div className="space-y-3">
                  <Link
                    to="/admin/dashboard/glosarium"
                    className="w-full flex items-center justify-between p-3.5 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold rounded-xl transition-all"
                  >
                    <span>Kelola Glosarium</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <Link
                    to="/admin/dashboard/categories"
                    className="w-full flex items-center justify-between p-3.5 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl transition-all"
                  >
                    <span>Kelola Kategori</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboardPage;
