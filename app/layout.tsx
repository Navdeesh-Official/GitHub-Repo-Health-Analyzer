import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GitHub Repo Health Analyzer | Is That Repo Worth Your Time?",
  description: "Analyze any public GitHub repository for documentation quality, maintenance activity, and beginner friendliness. Get an instant health score with clear explanations.",
  keywords: ["GitHub", "repository", "analyzer", "health score", "open source", "developer tool"],
  openGraph: {
    title: "GitHub Repo Health Analyzer",
    description: "Instant health reports for public GitHub repositories.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-200`}
      >
        {children}
      </body>
    </html>
  );
}
