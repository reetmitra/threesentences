import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Young_Serif, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import "./landing.css";

// The page: a heavy round serif for headlines over a clear text serif.
const display = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const text = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-text", display: "swap" });

// The app's own UI sans, used only inside the drawings of its screens. Not preloaded.
const schibsted = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", preload: false });

export const metadata: Metadata = {
  title: "Three Sentences by 363™",
  description:
    "Write three sentences about your day. A private daily journaling practice for adults 18 and over, with a small circle of friends. Invite only, iOS first.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body
        className={`${display.variable} ${text.variable} ${schibsted.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
