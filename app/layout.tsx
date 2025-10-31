import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobAssistant x402 - AI Cover Letter Generator",
  description: "Generate personalized cover letters with AI for only $0.10 USDC. Verified humans pay 10x less than bots.",
  keywords: ["cover letter", "job application", "AI", "x402", "Self Protocol", "Celo", "USDC"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
