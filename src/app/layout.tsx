import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEO Genius — AI-Powered SEO Intelligence",
  description:
    "Chat with your Google Search Console data. Get AI-driven SEO analysis and actionable recommendations.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
       <link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
      </head>
      <body className="bg-ink-950 text-white antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0f0f1a",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "DM Sans, sans-serif",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
