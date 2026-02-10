import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Suit Masters - Elevate Your Style with Premium Custom Suits",
  description:
    "Explore our curated suits, each designed with precision and an unwavering commitment to quality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* <AuthProvider> */}
        <div className="mx-auto px-2 sm:px-0 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <Navbar />
          <main className="min-h-[80vh]">{children}</main>
          <Footer />
          <ToastContainer position="bottom-right" />
        </div>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
