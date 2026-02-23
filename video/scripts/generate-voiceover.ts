import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve } from "path";

/**
 * Generate voiceover for ProductDemoV2 using ElevenLabs TTS API.
 *
 * Setup:
 *   1. Add ELEVENLABS_API_KEY=your_key to .env.local (project root)
 *   2. Run: cd video && npm run voiceover
 *
 * The script generates a single audio file. Silence gaps are handled
 * by offsetting the audio in the Remotion composition.
 */

// Load .env.local from project root
function loadEnvLocal() {
  const envPaths = [
    resolve(__dirname, "..", "..", ".env.local"),  // threesentences/.env.local
    resolve(__dirname, "..", ".env.local"),         // video/.env.local
  ];
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      console.log(`Loaded env from: ${envPath}`);
      break;
    }
  }
}

loadEnvLocal();

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("Error: ELEVENLABS_API_KEY not found.");
  console.error("\nSetup:");
  console.error("  1. Add ELEVENLABS_API_KEY=your_key to .env.local (project root)");
  console.error("  2. Run: cd video && npm run voiceover");
  console.error("\nGet your API key at: https://elevenlabs.io/app/settings/api-keys");
  process.exit(1);
}

// Voice: "Daniel" — British narrator, deep and cinematic.
// Premium voice for product demos and documentaries.
// Browse voices at: https://elevenlabs.io/voice-library
const VOICE_ID = "onwK4e9ZLuTAKqWW03F9"; // Daniel

// Voiceover script — timed narration with pauses for visual breathing.
// Silence gaps are handled by the volume function in ProductDemoV2.tsx.
const VOICEOVER_TEXT = `You wrote for three days. Then you stopped.

Because you were writing too much.

Three sentences. No more.

When you can only say three things... you say the right things.

Your AI mirror reveals patterns you can't see yourself.

363 days to better. Two days of grace.`;

const OUTPUT_PATH = join(__dirname, "..", "public", "voiceover-v2.mp3");

async function generateVoiceover() {
  console.log("Generating voiceover with ElevenLabs...");
  console.log(`Voice: Daniel (${VOICE_ID})`);
  console.log(`Output: ${OUTPUT_PATH}`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY!,
      },
      body: JSON.stringify({
        text: VOICEOVER_TEXT,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`ElevenLabs API error (${response.status}):`, error);
    process.exit(1);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeFileSync(OUTPUT_PATH, buffer);

  console.log(`Voiceover generated successfully! (${(buffer.length / 1024).toFixed(1)} KB)`);
  console.log("\nNext steps:");
  console.log("1. Open Remotion Studio: npm run studio");
  console.log("2. Select ProductDemoV2");
  console.log("3. Fine-tune audio timing in ProductDemoV2.tsx");
}

generateVoiceover().catch((err) => {
  console.error("Failed to generate voiceover:", err);
  process.exit(1);
});
