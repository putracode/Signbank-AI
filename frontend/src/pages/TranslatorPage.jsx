import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
// import { predictSign } from '../services/api'; 

function TranslatorPage() {
  const { videoRef, status, error, captureFrame } = useCamera();
  
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranslate = async () => {
    if (status !== 'active') {
      alert("Kamera belum aktif!");
      return;
    }

    const imageBase64 = captureFrame();
    if (!imageBase64) return;

    setIsProcessing(true);
    setResult("Memproses isyarat...");

    try {
      await new Promise(res => setTimeout(res, 1000));
      setResult("Hasil simulasi: Menunggu integrasi sistem");
    } catch (err) {
      setResult("Gagal menghubungi sistem.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col p-6 sticky top-0 h-screen">        
        <nav className="space-y-2 flex-1">
          <div className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium flex items-center gap-3 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Penerjemah
          </div>

          <Link to="/glossary" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Glosarium
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <span className="text-xl font-bold text-blue-700">SignBank AI</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Penerjemah</h1>
            <span className={`text-xs px-2 py-1 rounded-full ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {status === 'active' ? '● Kamera Aktif' : '○ Menunggu'}
            </span>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {status === 'active' ? 'SIARAN LANGSUNG' : 'KAMERA MATI'}
                </span>
              </div>
            </div>
            
            <div className="relative bg-gray-900 aspect-video lg:h-[450px] flex items-center justify-center overflow-hidden">
              {status === 'error' && <p className="text-red-400 text-sm px-4">Kesalahan: {error}</p>}
              {status === 'loading' && <p className="text-white text-sm">Memuat Kamera...</p>}
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'active' ? 'opacity-100' : 'opacity-0 absolute'}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border-l-4 border-blue-500 shadow-sm p-6 relative">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Hasil Terjemahan
              </h3>
              <p className={`text-xl font-medium leading-relaxed min-h-[80px] ${isProcessing ? 'text-blue-400 italic' : 'text-gray-900'}`}>
                {result || '"Menunggu isyarat..."'}
              </p>
            </div>

            <div className="bg-white rounded-xl border-l-4 border-green-500 shadow-sm p-6 relative">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Respon Petugas
              </h3>
              <p className="text-xl text-gray-500 italic font-medium leading-relaxed min-h-[80px]">
                "Silakan siapkan KTP Anda."
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleTranslate}
              disabled={isProcessing || status !== 'active'}
              className={`px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all ${isProcessing || status !== 'active' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 transform hover:scale-105'}`}
            >
              {isProcessing ? 'Menerjemahkan...' : 'Terjemahkan Sekarang'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TranslatorPage;