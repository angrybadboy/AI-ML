import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/auth/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroLab — 딥러닝 체험 플랫폼",
  description: "CNN 손글씨 인식, 이미지 증강, 학습 시각화를 브라우저에서 직접 체험하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full light`}
      style={{ colorScheme: "light" }}
    >
      <body className="flex min-h-full flex-col bg-[#fafafa] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
