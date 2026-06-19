"use client";

import { RefObject, useEffect } from "react";

const VIDEO_SRC = `${process.env.NEXT_PUBLIC_S3}studio57.mp4`;

type HeroVideoProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  onPlayingChange: (playing: boolean) => void;
};

export default function HeroVideo({ videoRef, onPlayingChange }: HeroVideoProps) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video
        .play()
        .then(() => onPlayingChange(true))
        .catch(() => onPlayingChange(false));
    };

    video.addEventListener("loadeddata", tryPlay);
    return () => video.removeEventListener("loadeddata", tryPlay);
  }, [videoRef, onPlayingChange]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#1b1a18]">
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        autoPlay
        className="h-full w-full object-cover"
        onPlay={() => onPlayingChange(true)}
        onPause={() => onPlayingChange(false)}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
    </div>
  );
}
