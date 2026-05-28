import { useRef, useState, useEffect, useCallback } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;
    const startCamera = async () => {
      try {
        setStatus('loading');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user', 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 },
            frameRate: { ideal: 60, min: 30 }
          }
        });
        if (isActive && videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus('active');
          setError(null);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || 'Izin kamera ditolak atau perangkat tidak tersedia.');
          setStatus('error');
        }
      }
    };

    startCamera();


    return () => {
      isActive = false;
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  const captureFrame = useCallback(() => {
    if (!videoRef.current || status !== 'active') return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [status]);

  return { videoRef, status, error, captureFrame };
}