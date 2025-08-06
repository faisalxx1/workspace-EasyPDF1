import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/error-boundary";

// Temporarily disabled due to network issues
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "EasyPDF Tools - Free Online PDF Editor & Converter | Merge, Split, Compress PDFs",
  description: "100% Free online PDF tools to merge, split, compress, convert, rotate, unlock, and edit PDF files. No registration required. Secure, fast, and easy to use. Process unlimited PDFs.",
  keywords: [
    "PDF tools", "PDF editor", "PDF converter", "PDF merger", "PDF splitter", "PDF compressor", 
    "PDF to Word", "PDF to Excel", "PDF to JPG", "rotate PDF", "unlock PDF", "watermark PDF", 
    "OCR PDF", "PDF reader", "edit PDF", "compress PDF file", "merge PDF files", "split PDF pages",
    "online PDF tools", "free PDF editor", "PDF software", "PDF converter online", "PDF merger online",
    "PDF compression", "PDF optimizer", "reduce PDF size", "PDF signature", "digital signature PDF",
    "extract text from PDF", "PDF to text", "searchable PDF", "batch PDF processing"
  ],
  authors: [{ name: "EasyPDF Tools Team" }],
  creator: "EasyPDF Tools",
  publisher: "EasyPDF Tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "EasyPDF Tools - Free Online PDF Editor & Converter",
    description: "100% Free online PDF tools to merge, split, compress, convert, rotate, unlock, and edit PDF files. No registration required. Secure, fast, and easy to use.",
    url: "https://easypdftools.com",
    siteName: "EasyPDF Tools",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EasyPDF Tools - Free Online PDF Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyPDF Tools - Free Online PDF Editor & Converter",
    description: "100% Free online PDF tools to merge, split, compress, convert, rotate, unlock, and edit PDF files. No registration required.",
    images: ["/twitter-image.jpg"],
    creator: "@easypdftools",
  },
  alternates: {
    canonical: "https://easypdftools.com",
  },
  other: {
    "twitter:label1": "Price",
    "twitter:data1": "Free",
    "twitter:label2": "Availability",
    "twitter:data2": "Online, No Registration",
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground"
      >
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
