"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { heroSliderImages } from "@/lib/site/assets";
import { cn } from "@/lib/utils";

const SLIDE_MS = 6500;
const FADE_MS = 2200;

export function HeroBackgroundSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (heroSliderImages.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSliderImages.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (heroSliderImages.length <= 1) {
      return;
    }
    const nextIndex = (index + 1) % heroSliderImages.length;
    const preload = new window.Image();
    preload.src = heroSliderImages[nextIndex];
  }, [index]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {heroSliderImages.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "scale-105 object-cover ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
          style={{
            transitionProperty: "opacity",
            transitionDuration: `${FADE_MS}ms`,
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/25" aria-hidden />
    </div>
  );
}
