// SelfieCapture.tsx
import React, { useRef, useState, useEffect } from 'react';

/* ---------- IndexedDB helpers ---------- */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('selfie-store', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveBlobToIDB(key: string, blob: Blob) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    tx.objectStore('images').put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getBlobFromIDB(key: string) {
  const db = await openDB();
  return new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction('images', 'readonly');
    const req = tx.objectStore('images').get(key);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
}

/* ---------- Component ---------- */

export default function SelfieCapture({
  id = 'user-selfie',
  compact = false,
}: {
  id?: string;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOn, setCameraOn] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const blob = await getBlobFromIDB(id);
        if (blob) setPreviewUrl(URL.createObjectURL(blob));
      } catch (e) {
        console.warn('Failed to load selfie from IDB', e);
      }
    })();

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      stopCamera();
    };
   
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      console.error('getUserMedia error', err);
      alert('Could not access camera. Check permissions and HTTPS.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }

  async function capture() {
    if (!videoRef.current) return;

    const canvas = canvasRef.current!;
    const video = videoRef.current;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    const blob = await new Promise<Blob | null>(res =>
      canvas.toBlob(b => res(b), 'image/jpeg', 0.85)
    );
    if (!blob) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    await saveBlobToIDB(id, blob);
    stopCamera();
  }

  if (!compact) return null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent">
      {/* Video or saved image fills the slot */}
      {isCameraOn ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
      ) : previewUrl ? (
        <img
          src={previewUrl}
          alt="selfie"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {/* Centered button overlay */}
      {/* Bottom-centered button overlay (all screen sizes) */}
<div className="absolute inset-0 z-20 flex items-end justify-center  translate-y-[-5%] -translate-x-[0%]">
  {!isCameraOn ? (
    <button
      onClick={startCamera}
      className="
        bg-white/90 shadow rounded
        text-[8px] sm:text-sm
        px-2 py-1 sm:px-3 sm:py-1.5
        max-w-[92%]
        text-center
        whitespace-normal
        leading-tight
      "
    >
      set photo
    </button>
  ) : (
    <button
      onClick={capture}
      className="
        bg-white/90 shadow rounded
        text-[11px] sm:text-sm
        px-2 py-1 sm:px-3 sm:py-1.5
        max-w-[92%]
      "
    >
      Snap
    </button>
  )}
</div>


      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
