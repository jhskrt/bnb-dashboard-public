import type { Metadata } from "next";
import "./globals.css";
import Provider from "./Provider";

export const metadata: Metadata = {
  title: "BNB Dashboard",
  description: "Dashboard for managing a guesthouse business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className="h-full">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
