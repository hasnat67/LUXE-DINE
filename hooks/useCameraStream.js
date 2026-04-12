import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to access and manage the device camera feed via WebRTC.
 */
export function useCameraStream() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not available in this browser or requires HTTPS.");
        }

        // Request the rear camera if available
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        
        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Required for iOS Safari to play inline without fullscreen
          videoRef.current.playsInline = true;
          videoRef.current.setAttribute('playsinline', 'playsinline'); 
          videoRef.current.play().catch(e => {
            console.error("Video auto-play failed", e);
          });
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
        setError(err.message || 'Unable to access camera.');
      }
    };

    startCamera();

    // Cleanup function to stop all video tracks when component unmounts
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { videoRef, stream, error };
}
