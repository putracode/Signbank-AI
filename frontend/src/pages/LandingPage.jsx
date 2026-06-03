import { Link } from 'react-router-dom';
import tellerBankImage from "../assets/teller-bank.jpg";
import bahasaIsyaratImage from "../assets/bahasa-isyarat.jpg";

function LandingPage() {
  return (
    <div className="w-full">
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Menghubungkan Komunikasi 
                <span className="text-blue-700"> Kita.</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed">
                Signbank memanfaatkan kecerdasan buatan untuk menyediakan 
                terjemahan real-time antara bahasa isyarat dan ucapan, memastikan 
                layanan keuangan inklusif bagi komunitas Tuli.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  to="/translator" 
                  className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Mulai Layanan
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>

                <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-8 py-3 rounded-lg transition-all duration-200">
                  Lihat Demo
                </button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={tellerBankImage} 
                  alt="Petugas bank tersenyum" 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Kemampuan Utama AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Interaksi lancar yang didukung oleh mesin penerjemah neural.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-700 text-white p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Terjemahan Isyarat-ke-Teks</h3>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Computer Vision kami mengidentifikasi gerakan tangan, 
                mengubah bahasa isyarat menjadi teks untuk petugas bank secara real-time.
              </p>
              
              <div className="mt-auto rounded-xl overflow-hidden shadow-inner bg-gray-100 aspect-video relative group">
                <img 
                  src={bahasaIsyaratImage} 
                  alt="Deteksi bahasa isyarat" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-500 text-white p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Kejelasan Ucapan-ke-Teks</h3>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Mengubah penjelasan petugas menjadi teks yang jelas dan akurat di layar pelanggan.
              </p>
              
              <div className="mt-auto rounded-xl overflow-hidden shadow-inner bg-gray-100 aspect-video relative group flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                 <div className="space-y-4 w-3/4">
                    <div className="bg-white p-4 rounded-lg rounded-tl-none shadow-sm border border-gray-100 animate-pulse">
                        <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg rounded-tr-none shadow-sm border border-blue-200 self-end">
                        <div className="h-2 bg-blue-200 rounded w-2/3 mb-2"></div>
                        <div className="h-2 bg-blue-200 rounded w-1/3"></div>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="bg-blue-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-white text-3xl lg:text-4xl font-bold">
            Siap untuk Masa Depan yang Lebih Inklusif?
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
            Implementasikan SignBank AI di institusi Anda hari ini dan transformasikan cara Anda melayani setiap pelanggan dengan kesetaraan dan kecerdasan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              to="/translator" 
              className="bg-white text-blue-900 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Mulai Layanan Sekarang
            </Link>

          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold text-blue-900">SignBank AI</div>
          <div className="text-sm text-gray-500">© 2026 SignBank AI. CC26-PSU273</div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;