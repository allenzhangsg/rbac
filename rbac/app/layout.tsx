import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClientAuthProvider } from "@/components/ClientAuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RBAC",
  description: "Role-Based Access Control Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen h-full`}
      >
        <ClientAuthProvider>
          <Header />
          <ToastProvider>
            <main className="flex-grow flex">
              {children}
            </main>
          </ToastProvider>
          <Footer />
        </ClientAuthProvider>
      </body>
    </html>
  );
}
