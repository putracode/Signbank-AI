import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api, { API_URL } from "../services/api";

function GlossaryDetailPage() {
  const { id } = useParams();
  const [term, setTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTerm();
  }, [id]);

  const fetchTerm = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/glosarium/${id}`);
      setTerm(data.data);
    } catch (err) {
      console.error("Gagal mengambil detail:", err);
      setError("Gagal memuat detail istilah.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memuat detail istilah...</p>
        </div>
      </div>
    );
  }

  if (error || !term) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Istilah tidak ditemukan."}</p>
          <Link to="/glossary" className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md inline-block">
            Kembali ke Glosarium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <nav className="mb-8">
          <Link to="/glossary" className="text-blue-700 font-semibold flex items-center gap-2 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Glosarium
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wider">
                  {term.categoryName || "Umum"}
                </span>
                <span className="text-gray-400 text-xs font-medium">• Diperbarui {new Date(term.updatedAt).toLocaleDateString('id-ID')}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {term.termName}
              </h1>
              <div className="prose prose-blue max-w-none">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Definisi
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {term.description}
                </p>
              </div>
            </div>

            <div className="bg-blue-700 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Ingin Mengetahui Lebih Banyak?</h3>
                <p className="text-blue-100 mb-6 text-lg">
                  Pelajari berbagai istilah keuangan lainnya dalam glosarium kami yang dirancang khusus untuk mempermudah aksesibilitas bagi komunitas Tuli.
                </p>
                <Link to="/glossary" className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-block shadow-lg">
                  Pelajari Lainnya
                </Link>
              </div>
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl group-hover:bg-blue-500/40 transition-colors"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Video Bahasa Isyarat
                </h3>
              </div>
              
              <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-inner relative group">
                {term.videoUrl ? (
                  <video 
                    src={`${API_URL}${term.videoUrl}`}
                    controls 
                    className="w-full h-full object-contain"
                    poster={term.thumbnailUrl ? `${API_URL}${term.thumbnailUrl}` : ""}
                  ></video>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="font-medium">Video panduan bahasa isyarat untuk istilah ini belum tersedia.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  <strong>Tips:</strong> Anda dapat mempercepat atau memperlambat video melalui pengaturan pemutar video untuk membantu proses belajar gerakan isyarat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlossaryDetailPage;
