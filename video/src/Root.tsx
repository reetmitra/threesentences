import { Composition } from "remotion";
import { BrandIntro } from "./BrandIntro";
import { ProductDemo } from "./ProductDemo";
import { ProductDemoV2 } from "./ProductDemoV2";
import { OpenClawdPromo } from "./OpenClawdPromo";
import { ThreeSentencesPromo } from "./ThreeSentencesPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ─── V2: Elite 4K product demo ─────────────────────────── */}
      <Composition
        id="ProductDemoV2"
        component={ProductDemoV2}
        durationInFrames={900}
        fps={30}
        width={3840}
        height={2160}
      />
      {/* 1080p variant of V2 */}
      <Composition
        id="ProductDemoV2-1080"
        component={ProductDemoV2}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* ─── Legacy: original product demo ─────────────────────── */}
      <Composition
        id="ProductDemo"
        component={ProductDemo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* 1:1 square variant for social media */}
      <Composition
        id="ProductDemoSquare"
        component={ProductDemo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1080}
      />
      {/* 16:9 for YouTube / general use */}
      <Composition
        id="BrandIntro"
        component={BrandIntro}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* 1:1 square for Instagram / social media */}
      <Composition
        id="BrandIntroSquare"
        component={BrandIntro}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1080}
      />
      {/* 37-second OpenClawd promo video */}
      <Composition
        id="OpenClawdPromo"
        component={OpenClawdPromo}
        durationInFrames={1110}
        fps={30}
        width={1080}
        height={700}
      />
      {/* 37-second Three Sentences promo video (portrait 9:16) */}
      <Composition
        id="ThreeSentencesPromo"
        component={ThreeSentencesPromo}
        durationInFrames={1110}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
