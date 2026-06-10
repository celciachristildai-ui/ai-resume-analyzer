import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeAI",
  description: "AI-powered resume analysis and builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}