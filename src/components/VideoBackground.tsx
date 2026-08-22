import { useState } from "react";
import { useCanPlayVideo } from "@/hooks/useCanPlayVideo";

export function VideoBackground() {
  const canPlay = useCanPlayVideo();
  const [failed, setFailed] = useState(false);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {canPlay && !failed ? (
        <video
          className="size-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/hero-poster.webp"
          onError={() => setFailed(true)}
        >
          <source src="/media/hero-loop.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="hero-fallback absolute inset-0" />
      )}
      <div className="hero-overlay absolute inset-0" />
      <div className="hero-edge-blur absolute inset-0" />
    </div>
  );
}
