import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "45 920",
  fallback: ["-apple-system", "Apple SD Gothic Neo", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2027 신년운세",
  description: "이름과 생년월일만 알려주세요. AI가 2027년 운세를 알려드려요.",
  openGraph: {
    title: "2027 신년운세",
    description: "이름과 생년월일만 알려주세요. AI가 2027년 운세를 알려드려요.",
    images: [{ url: "/cover.png", width: 736, height: 920 }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
