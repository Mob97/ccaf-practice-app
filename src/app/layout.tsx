import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavHeader } from "@/components/NavHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CCAF Practice",
  description: "Practice questions for the Claude Certified AI Fundamentals exam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <NavHeader />
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
