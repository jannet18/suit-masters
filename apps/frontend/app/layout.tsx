import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-ignore: allow side-effect import of global CSS in this file
import "./globals.css";
import Header from "./components/common/Header";
import { ThemeProvider } from "./providers/theme-provider";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastContainer } from "react-toastify";
import { Footer } from "./components/common/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap"
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap"
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
    <html lang="en" data-scroll-behavior="smooth" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-svh flex-col`}
      >
        <Header />
        <ErrorBoundary>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {/* <div className="mx-auto px-2 sm:px-0 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl"> */}
              <main className="min-h-[80vh] w-full min-w-0 flex-1 pt-36">{children}</main>
            {/* </div> */}
          </AuthProvider>
        </ThemeProvider>
        </ErrorBoundary>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnHover
          pauseOnFocusLoss
          draggable
          theme="colored"
        />
      </body>
    </html>
  );
}
