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
    try {
      const tx = db.transaction('images', 'readwrite');
      const store = tx.objectStore('images');
      const req = store.put(blob, key);
      req.onsuccess = () => {
        resolve();
      };
      req.onerror = () => {
        console.error('IDB put error', req.error);
        reject(req.error);
      };
      tx.onabort = () => reject(tx.error || new Error('transaction aborted'));
      tx.onerror = () => reject(tx.error || new Error('transaction error'));
    } catch (err) {
      reject(err);
    }
  });
}

async function getBlobFromIDB(key: string) {
  const db = await openDB();
  return new Promise<Blob | undefined>((resolve, reject) => {
    try {
      const tx = db.transaction('images', 'readonly');
      const req = tx.objectStore('images').get(key);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => {
        console.error('IDB get error', req.error);
        reject(req.error);
      };
    } catch (err) {
      reject(err);
    }
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
      stopCamera();
    };
   
  }, [id]);

  async function startCamera(autoCapture = false) {
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
      // If autoCapture is requested, capture a single frame immediately
      if (autoCapture) {
        // give video a moment to produce a frame (capture() also waits)
        await capture();
      } else {
        setCameraOn(true);
      }
    } catch (err) {
      console.error('getUserMedia error', err);
      alert('Could not access camera. Check permissions and HTTPS.');
    }
  }

  function stopCamera() {
  const s = streamRef.current;
  if (s) {
    s.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
  setCameraOn(false);
}

async function capture() {
  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (!video || !canvas) {
    console.error("Video or canvas ref is missing");
    return;
  }

  // Ensure metadata is available
  if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
    await new Promise<void>((resolve) => {
      const onMeta = () => {
        video.removeEventListener("loadedmetadata", onMeta);
        resolve();
      };
      video.addEventListener("loadedmetadata", onMeta);
      setTimeout(() => {
        video.removeEventListener("loadedmetadata", onMeta);
        resolve();
      }, 800);
    });
  }

  // Ensure at least one frame has rendered
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await new Promise<void>((resolve) => {
      const onCanPlay = () => {
        video.removeEventListener("canplay", onCanPlay);
        resolve();
      };
      video.addEventListener("canplay", onCanPlay);
      setTimeout(() => {
        video.removeEventListener("canplay", onCanPlay);
        resolve();
      }, 800);
    });
  }

  // Wait a frame to ensure video is painted
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 720;

  console.log("Video dimensions:", w, h, "readyState:", video.readyState);

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Could not get canvas context");
    return;
  }

  ctx.drawImage(video, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob((b) => res(b), "image/jpeg", 0.85)
  );
  if (!blob) {
    console.error("Failed to create blob from canvas");
    return;
  }

  console.log("Blob created:", blob.size, "bytes");

  // Revoke old preview URL if exists
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  // Create preview and update UI
  const url = URL.createObjectURL(blob);
  setPreviewUrl(url);
  setCameraOn(false);

  // Save to IndexedDB
  try {
    await saveBlobToIDB(id, blob);
    console.log("Saved to IndexedDB successfully");
  } catch (err) {
    console.error("Failed to save selfie to IndexedDB", err);
  }

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
      onClick={() => startCamera()}
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
