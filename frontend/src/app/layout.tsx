import type { Metadata } from "next";
import { Manrope, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Trackify",
  description: "Seu app de gerenciamento de tarefas!",
};

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
  fallback: [],
  adjustFontFallback: false
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-source-code-pro",
  fallback: [],
  adjustFontFallback: false
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${sourceCodePro.variable}`}>
      <body className={`${manrope.className} bg-gray-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
