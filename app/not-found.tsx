import Link from "next/link";
import { siteConfig } from "@/site.config";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: siteConfig.notFoundTitle || "Page Not Found | 404 Error",
  description:
    siteConfig.notFoundDescription ||
    "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center px-4 py-8 md:py-12">
        <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-6">
          404
        </h1>
        <div className="w-10 h-px bg-gray-200 mb-8 mx-auto"></div>
        <p className="text-lg md:text-xl mb-10 text-gray-600 max-w-md mx-auto">
          {siteConfig.notFoundMessage || "Page not found"}
        </p>
        <Link
          href="/"
          className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300"
        >
          {siteConfig.returnToHome || "Return to Home"}
        </Link>
      </div>
    </div>
  );
}
