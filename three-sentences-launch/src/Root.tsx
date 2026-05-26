import React from "react";
import { Composition } from "remotion";
import "./fonts"; // side-effect: loads fonts + hooks delayRender
import { Launch } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ThreeSentencesLaunch"
      component={Launch}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
