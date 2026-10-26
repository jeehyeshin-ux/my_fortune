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

// 첫 페인트 전에 저장된 값(없으면 시스템 설정)으로 dark 클래스를 정해 깜빡임을 막는다.
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
