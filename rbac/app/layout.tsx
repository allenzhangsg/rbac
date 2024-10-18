import type { Metadata } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import "./globals.css";
import { UserMenu } from "@/components/UserMenu";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <header className="border-b">
          <div className="container mx-auto py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/favicon.ico" alt="Logo" width={24} height={24} />
              <h1 className="text-2xl font-bold ml-2">RBAC Application</h1>
            </div>
            <UserMenu />
          </div>
        </header>

        <main className="flex-grow">{children}</main>

        <footer className="border-t">
          <div className="container mx-auto py-4 text-center text-sm text-gray-600">
            © 2024 RBAC Application. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
