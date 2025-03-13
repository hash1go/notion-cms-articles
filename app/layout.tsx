import { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { siteConfig } from "@/site.config";
import "@/styles/globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: true,
  variable: "--font-noto-sans-jp",
  display: "swap",
  fallback: ["Hiragino Sans", "Hiragino Kaku Gothic ProN", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  ),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.lang}>
      <head>
        {/* Preconnect to Notion domains for faster image loading */}
        <link rel="preconnect" href="https://www.notion.so" />
        <link
          rel="preconnect"
          href="https://prod-files-secure.s3.us-west-2.amazonaws.com"
        />

        {/* Optional: Add this if you frequently use Unsplash images in your Notion pages */}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={notoSansJp.className}>
        <div className="relative overflow-hidden px-3 sm:px-4">
          <div className="flex flex-col items-center w-full mx-auto md:max-w-4xl lg:max-w-6xl xl:max-w-screen-xl">
            <Navbar />
            <main className="w-full pb-12 px-1 sm:px-2">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
