"use client";

import { useEffect, useState } from "react";
import { NIGHTS, tonightIndex } from "@/components/scene/night";

export function TonightTile() {
  const [night, setNight] = useState<number | null>(null);
  useEffect(() => setNight(tonightIndex() + 1), []);
  return (
    <div className="tile tile-night">
      <div className="moon-disc">
        <img
          src="/photos/moon.jpg"
          width={900}
          height={900}
          alt="The full moon, photographed by NASA"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div>
        <p className="small soft">Tonight</p>
        <p className="lead">{night ? `Night ${night} of ${NIGHTS}` : ""}</p>
      </div>
    </div>
  );
}
