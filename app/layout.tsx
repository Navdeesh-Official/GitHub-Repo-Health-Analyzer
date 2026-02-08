import type { Metadata } from "next";
import "./globals.css";

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
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://avatars.githubusercontent.com; font-src 'self' data:; connect-src 'self' https://api.github.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
        />
      </head>
      <body
        className="font-sans antialiased bg-slate-950 text-slate-200"
      >
        {children}
      </body>
    </html>
  );
}
