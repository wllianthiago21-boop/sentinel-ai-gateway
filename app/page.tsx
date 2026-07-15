import type { Metadata } from "next";
import { SentinelApp } from "./sentinel-app";

export const metadata: Metadata = {
  title: "SentinelAI Gateway — Segurança para agentes de IA",
  description: "Gateway open source que detecta prompt injection, vazamento de segredos e ferramentas inseguras antes que instruções de IA virem ações.",
};

export default function Home() {
  return <SentinelApp />;
}
