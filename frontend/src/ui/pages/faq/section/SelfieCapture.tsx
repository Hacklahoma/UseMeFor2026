// SelfieCapture.tsx
import React, { useEffect, useRef, useState } from "react";

/* ---------- IndexedDB helpers ---------- */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("selfie-store", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("images")) db.createObjectStore("images");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveBlobToIDB(key: string, blob: Blob) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error || new Error("transaction aborted"));
      tx.onerror = () => reject(tx.error || new Error("transaction error"));
    } catch (err) {
      reject(err);
    }
  });
}

async function getBlobFromIDB(key: string) {
  const db = await openDB();
  return new Promise<Blob | undefined>((resolve, reject) => {
    try {
      const tx = db.transaction("images", "readonly");
      const req = tx.objectStore("images").get(key);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/* ---------- Video readiness helper ---------- */

async function waitForVideoReady(video: HTMLVideoElement, timeoutMs = 2500) {
  const start = performance.now();

  // Ensure play has been attempted
  if (video.paused) {
    try {
      await video.play();
    } catch {
      // ignore (autoplay restrictions, etc.)
    }
  }

  // Wait for dimensions
  while (
    (!video.videoWidth || !video.videoHeight) &&
    performance.now() - start < timeoutMs
  ) {
    await new Promise((r) => setTimeout(r, 25));
  }

  // Wait for at least one painted frame
  if ("requestVideoFrameCallback" in video) {
    await new Promise<void>((resolve) => {
      // requestVideoFrameCallback is not yet in TypeScript's default DOM types
      (video as any).requestVideoFrameCallback(() => resolve());
    });
  } else {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }

  // tiny extra delay helps some webcams/browsers
  await new Promise((r) => setTimeout(r, 50));
}

/* ---------- Component ---------- */

export default function SelfieCapture({
  id = "user-selfie",
  compact = false,
}: {
  id?: string;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  const [isCameraOn, setCameraOn] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    (async () => {
      try {
        const blob = await getBlobFromIDB(id);
        if (!isMountedRef.current) return;
        if (blob) setPreviewUrl(URL.createObjectURL(blob));
      } catch (e) {
        console.warn("Failed to load selfie from IDB", e);
      }
    })();

    return () => {
      isMountedRef.current = false;
      stopCamera();
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  
  }, [id]);

  async function startCamera(autoCapture = false) {
    try {
      // IMPORTANT: ensures <video> is mounted/visible before attaching stream
      if (!isMountedRef.current) return;
      setCameraOn(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (!isMountedRef.current) {
        // Component unmounted during async operation - clean up stream
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;

        await video.play();
        await waitForVideoReady(video);
      }

      if (autoCapture && isMountedRef.current) {
        await capture();
      }
    } catch (err) {
      console.error("getUserMedia error", err);
      alert("Could not access camera. Check permissions and HTTPS.");
      if (isMountedRef.current) setCameraOn(false);
    }
  }

  function stopCamera() {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) video.srcObject = null;
    if (isMountedRef.current) setCameraOn(false);
  }

  async function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    await waitForVideoReady(video);

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      console.warn("Video not ready (no dimensions) — try again.");
      return;
    }

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", 0.85)
    );
    if (!blob) return;

    // update preview url safely
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });

    try {
      await saveBlobToIDB(id, blob);
    } catch (err) {
      console.error("Failed to save selfie to IndexedDB", err);
    }

    stopCamera();
  }

  if (!compact) return null;

  return (
    <div id={`selfie-capture-${id}`} className="selfie-capture relative w-full h-full overflow-hidden bg-transparent">
      {/* ALWAYS mounted video so ref is never null */}
      <video
        ref={videoRef}
        className={[
          "absolute inset-0 w-full h-full object-cover",
          isCameraOn ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
        style={{ transform: "scaleX(-1)" }}
        playsInline
        muted
      />

      {/* Saved image when camera is off */}
      {!isCameraOn && previewUrl ? (
        <img
          src={previewUrl}
          alt="selfie"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {/* Bottom-centered button overlay */}
      <div className="absolute inset-0 z-20 flex items-end justify-center translate-y-[-5%]">
        {!isCameraOn && !previewUrl ? (
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
        ) : !isCameraOn && previewUrl ? (
          <button
            onClick={() => {
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
              startCamera();
            }}
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
            retake
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
