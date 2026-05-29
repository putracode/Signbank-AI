import { useState } from "react";
import { Link } from "react-router-dom";
import { useCamera } from "../hooks/useCamera";
import useSpeechToText from "react-hook-speech-to-text";
// import { predictSign } from '../services/api';

function TranslatorPage() {
  const { videoRef, status, error, captureFrame } = useCamera();

  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    error: speechError,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    speechRecognitionProperties: {
      lang: "id-ID",
      interimResults: true,
    },
  });

  const transcript =
    (results || []).map((r) => (typeof r === "string" ? r : r.transcript)).join(" ") +
    (interimResult ? ` ${interimResult}` : "");

  const handleTranslate = async () => {
    if (status !== "active") {
      alert("Kamera belum aktif!");
      return;
    }

    const imageBase64 = captureFrame();
    if (!imageBase64) return;

    setIsProcessing(true);
    setResult("Memproses isyarat...");

    try {
      await new Promise((res) => setTimeout(res, 1000));
      setResult("Hasil simulasi: Menunggu integrasi sistem");
    } catch (err) {
      setResult("Gagal menghubungi sistem.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Page Title & Status */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">Penerjemah</h1>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
                  status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status === "active" ? "bg-green-500 animate-pulse" : "bg-slate-400"}`}></span>
                {status === "active" ? "Kamera Aktif" : "Menunggu"}
              </span>
            </div>

            {/* Speech to Text Toggle in header area */}
            <button
              onClick={isRecording ? stopSpeechToText : startSpeechToText}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {isRecording ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                  Matikan Mic Petugas
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                  </svg>
                  Nyalakan Mic
                </>
              )}
            </button>
          </div>

          {/* Main 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Access Camera & Real-Time Monitoring */}
            <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
              
              {/* Camera Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    AKSES KAMERA
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Camera Icon */}
                  <svg className="w-4.5 h-4.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  {/* Settings Icon */}
                  <svg className="w-4.5 h-4.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
              </div>

              {/* Camera Video / Stream Container */}
              <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden min-h-[350px]">
                {status === "error" && (
                  <div className="text-center p-6">
                    <p className="text-red-400 text-sm font-semibold mb-2">Kesalahan Kamera</p>
                    <p className="text-slate-400 text-xs">{error}</p>
                  </div>
                )}
                {status === "loading" && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-300 text-sm font-medium">Memuat Kamera...</p>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    status === "active" ? "opacity-100" : "opacity-0 absolute"
                  }`}
                />

                {/* Hand Detection Dotted Box/Overlay */}
                {/* {status === "active" && (
                  <div className="absolute inset-8 border-2 border-dashed border-blue-400/40 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-t-2 border-l-2 border-blue-400"></span>
                      <span className="w-4 h-4 border-t-2 border-r-2 border-blue-400"></span>
                    </div>
                    <div className="text-center text-blue-400/40 text-xs font-mono tracking-widest uppercase">
                      Hand gesture detection boundary
                    </div>
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-b-2 border-l-2 border-blue-400"></span>
                      <span className="w-4 h-4 border-b-2 border-r-2 border-blue-400"></span>
                    </div>
                  </div>
                )} */}

                {/* Idle Background Overlay with skeletal hand illustration style */}
                {status !== "active" && status !== "loading" && (
                  <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md">
                      <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-blue-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <p className="text-slate-200 font-semibold mb-1.5">Kamera belum dinyalakan</p>
                      <p className="text-slate-400 text-xs">
                        Izinkan akses kamera di browser Anda untuk memulai monitoring bahasa isyarat real-time.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Blue Footer Bar */}
              <div className="bg-[#0b5cff] text-white px-5 py-3.5 flex items-center justify-between font-bold text-xs uppercase tracking-wider">
                <span>DETECTED SIGN</span>
                <span className="opacity-90">CONFIDENCE: {status === "active" ? "92%" : "0%"}</span>
              </div>
            </div>

            {/* Right Column: Stacked Text Boxes */}
            <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
              
              {/* Panel 1: Output Teks (Sign to Text) */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-start min-h-[240px]">
                <div className="flex items-center gap-2 mb-4">
                  {/* Chat Icon */}
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    OUTPUT TEKS (SIGN-TO-TEXT)
                  </h3>
                </div>
                <div className="flex-1 flex items-center">
                  <p className={`text-xl lg:text-xl font-medium leading-relaxed text-slate-800 ${isProcessing ? "text-blue-500 animate-pulse" : ""}`}>
                    {result ? `"${result}"` : `"Saya ingin membuka rekening tabungan baru untuk anak saya."`}
                  </p>
                </div>
              </div>

              {/* Panel 2: Input Suara Petugas (Speech to Text) */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-start min-h-[240px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {/* Microphone Icon */}
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                    </svg>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      INPUT SUARA PETUGAS (SPEECH-TO-TEXT)
                    </h3>
                  </div>

                  {/* Waveform Animation */}
                  <div className="flex items-center gap-0.5">
                    <span className={`w-0.75 h-3.5 bg-blue-600 rounded-full ${isRecording ? "animate-bounce" : "opacity-60"}`}></span>
                    <span className={`w-0.75 h-5 bg-blue-600 rounded-full ${isRecording ? "animate-bounce [animation-delay:0.15s]" : "opacity-60"}`}></span>
                    <span className={`w-0.75 h-3 bg-blue-600 rounded-full ${isRecording ? "animate-bounce [animation-delay:0.3s]" : "opacity-60"}`}></span>
                  </div>
                </div>
                
                {speechError && (
                  <p className="text-xs text-red-500 mb-2">Browser tidak mendukung Speech Recognition.</p>
                )}

                <div className="flex-1 flex items-center">
                  <p className={`text-lg lg:text-xl font-normal leading-relaxed text-slate-500 italic`}>
                    {transcript ? `"${transcript}"` : `"Tentu, silakan siapkan KTP dan setoran awal minimal sepuluh ribu rupiah..."`}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleTranslate}
              disabled={isProcessing || status !== "active"}
              className={`px-8 py-4 rounded-full font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                isProcessing || status !== "active"
                  ? "bg-slate-300 cursor-not-allowed text-slate-500"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menerjemahkan...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Terjemahkan Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TranslatorPage;
