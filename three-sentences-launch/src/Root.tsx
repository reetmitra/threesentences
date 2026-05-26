import React from "react";
import { Composition } from "remotion";
import "./fonts"; // side-effect: loads fonts + hooks delayRender
import { Launch } from "./Composition";
import { LaunchFilm } from "./LaunchFilm";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Original 10-second teaser (1080×1920, 9:16) */}
      <Composition
        id="ThreeSentencesLaunch"
        component={Launch}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 55-second editorial launch film — three aspect ratios */}
      <Composition
        id="LaunchFilm"
        component={LaunchFilm}
        durationInFrames={1650}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LaunchFilm-9x16"
        component={LaunchFilm}
        durationInFrames={1650}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LaunchFilm-1x1"
        component={LaunchFilm}
        durationInFrames={1650}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
