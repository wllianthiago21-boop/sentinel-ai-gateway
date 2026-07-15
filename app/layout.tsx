import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const safeHost = /^[a-z0-9.-]+(?::\d+)?$/i.test(forwardedHost) ? forwardedHost : "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol === "http" || safeHost.startsWith("localhost") ? "http" : "https";
  const metadataBase = new URL(`${protocol}://${safeHost}`);
  const socialImage = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: {
      default: "SentinelAI Gateway",
      template: "%s · SentinelAI Gateway",
    },
    description: "Proteção open source e explicável para prompts, respostas e ferramentas de agentes de IA.",
    applicationName: "SentinelAI Gateway",
    keywords: ["AI security", "prompt injection", "LLM security", "guardrails", "OWASP", "open source"],
    authors: [{ name: "Willian Thiago · WILLTEC", url: "https://github.com/wllianthiago21-boop" }],
    creator: "Willian Thiago · WILLTEC · @wllianthiago21-boop",
    publisher: "WILLTEC",
    openGraph: {
      type: "website",
      title: "SentinelAI Gateway",
      description: "Bloqueie instruções inseguras de IA antes que elas virem ações.",
      images: [{ url: socialImage, width: 1731, height: 909, alt: "SentinelAI Gateway security control plane" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "SentinelAI Gateway",
      description: "Proteção explicável para agentes e aplicações de IA.",
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07110f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
