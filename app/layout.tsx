import type { Metadata } from "next";
import { Courier_Prime, Geist, Corinthia, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });
const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

const courierPrime = Courier_Prime({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

const corinthia = Corinthia({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
});
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "CODE GAZETTE",
  description: "serving web development blogs!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${libreBaskerville.className} ${courierPrime.className} ${corinthia.className} antialiased bg-gradient-to-b from-[#0b0d0e] to-[#090b0c] overflow-auto`}
      >
        <Navbar />
        <ScrollProgress className="rounded-full bg-gradient-to-br from-white via-gray-300 to-amber-300" />
        {children}
      </body>
    </html>
  );
}
