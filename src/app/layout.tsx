import type { Metadata } from "next";
import { Open_Sans } from "next/font/google"; // Import Open Sans
import "./globals.css";

// Load Open Sans font
const openSans = Open_Sans({
  subsets: ["latin"], // Specify the subset(s) you want to load
  variable: "--font-open-sans", // Define a CSS variable for the font
});

export const metadata: Metadata = {
  title: "TekJuice Enquiry Form",
  description: "Submit Enquiries Through This Form. Created by Elisha M.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} font-sans antialiased`} // Apply Open Sans and sans-serif fallback
      >
        {children}
      </body>
    </html>
  );
}