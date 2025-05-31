"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { siteConfig } from "@/config/site.config";
import Script from "next/script";

const Footer = () => {
  const [discordCopied, setDiscordCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみ実行するためのフラグ
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDiscordClick = () => {
    if (siteConfig.discordId) {
      navigator.clipboard
        .writeText(siteConfig.discordId)
        .then(() => {
          setDiscordCopied(true);
          setTimeout(() => {
            setDiscordCopied(false);
          }, 2000); // 2秒後に自動で閉じる
        })
        .catch((err) => {
          console.error("Failed to copy Discord ID: ", err);
        });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="text-center bg-gray-900 text-white w-screen block"
      aria-label="Site Footer"
    >
      {/* 構造化データ for SEO */}
      {mounted && (
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteConfig.title,
              url: typeof window !== "undefined" ? window.location.origin : "",
              // 値が存在する場合のみsameAsに含める
              ...(Object.values([
                siteConfig.twitterUrl,
                siteConfig.farcasterUrl,
                siteConfig.instagramUrl,
                siteConfig.githubUrl,
              ]).some(Boolean) && {
                sameAs: [
                  siteConfig.twitterUrl,
                  siteConfig.farcasterUrl,
                  siteConfig.instagramUrl,
                  siteConfig.githubUrl,
                ].filter(Boolean),
              }),
            }),
          }}
          strategy="afterInteractive"
        />
      )}
      <div className="container px-6 pt-6 flex flex-col items-center max-w-2xl w-full mx-auto">
        <div className="flex justify-center items-center mb-6 text-white">
          {/* X */}
          {siteConfig.twitterUrl && (
            <a
              href={siteConfig.twitterUrl}
              aria-label={`X account link of ${siteConfig.adminName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="X"
                className="w-6 h-full mx-4"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 1227"
              >
                <path
                  fill="currentColor"
                  d="m714.163 519.284 446.727-519.284h-105.86l-387.893 450.887-309.809-450.887h-357.328l468.492 681.821-468.492 544.549h105.866l409.625-476.152 327.181 476.152h357.328l-485.863-707.086zm-144.998 168.544-47.468-67.894-377.686-540.2396h162.604l304.797 435.9906 47.468 67.894 396.2 566.721h-162.604l-323.311-462.446z"
                ></path>
              </svg>
            </a>
          )}

          {/* Farcaster */}
          {siteConfig.farcasterUrl && (
            <a
              href={siteConfig.farcasterUrl}
              aria-label={`Farcaster channel link of ${siteConfig.adminName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="Farcaster"
                className="w-6 h-full mx-4 transform scale-110"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 29"
              >
                <path
                  fill="currentColor"
                  d="M 5.507 0.072 L 26.097 0.072 L 26.097 4.167 L 31.952 4.167 L 30.725 8.263 L 29.686 8.263 L 29.686 24.833 C 30.207 24.833 30.63 25.249 30.63 25.763 L 30.63 26.88 L 30.819 26.88 C 31.341 26.88 31.764 27.297 31.764 27.811 L 31.764 28.928 L 21.185 28.928 L 21.185 27.811 C 21.185 27.297 21.608 26.88 22.13 26.88 L 22.319 26.88 L 22.319 25.763 C 22.319 25.316 22.639 24.943 23.065 24.853 L 23.045 15.71 C 22.711 12.057 19.596 9.194 15.802 9.194 C 12.008 9.194 8.893 12.057 8.559 15.71 L 8.539 24.845 C 9.043 24.919 9.663 25.302 9.663 25.763 L 9.663 26.88 L 9.852 26.88 C 10.373 26.88 10.796 27.297 10.796 27.811 L 10.796 28.928 L 0.218 28.928 L 0.218 27.811 C 0.218 27.297 0.641 26.88 1.162 26.88 L 1.351 26.88 L 1.351 25.763 C 1.351 25.249 1.774 24.833 2.296 24.833 L 2.296 8.263 L 1.257 8.263 L 0.029 4.167 L 5.507 4.167 L 5.507 0.072 Z"
                ></path>
              </svg>
            </a>
          )}

          {/* Instagram */}
          {siteConfig.instagramUrl && (
            <a
              href={siteConfig.instagramUrl}
              aria-label={`Instagram account link of ${siteConfig.adminName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="instagram"
                className="w-6 h-full mx-4 transform scale-110"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  fill="currentColor"
                  d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                ></path>
              </svg>
            </a>
          )}

          {/* Github */}
          {siteConfig.githubUrl && (
            <a
              href={siteConfig.githubUrl}
              aria-label={`Github account link of ${siteConfig.adminName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="github"
                className="w-6 h-full mx-4 transform scale-110"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 496 512"
              >
                <path
                  fill="currentColor"
                  d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
                ></path>
              </svg>
            </a>
          )}

          {/* Discord */}
          {siteConfig.discordId && (
            <button
              onClick={handleDiscordClick}
              aria-label={`Copy Discord ID of ${siteConfig.adminName}`}
              className="w-6 h-full mx-4 focus:outline-none transform scale-125"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="discord"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 60 44"
              >
                <path
                  fill="currentColor"
                  d="M37.1937 0C36.6265 1.0071 36.1172 2.04893 35.6541 3.11392C31.2553 2.45409 26.7754 2.45409 22.365 3.11392C21.9136 2.04893 21.3926 1.0071 20.8254 0C16.6928 0.70613 12.6644 1.94475 8.84436 3.69271C1.27372 14.9098 -0.775214 25.8374 0.243466 36.6146C4.67704 39.8906 9.6431 42.391 14.9333 43.9884C16.1256 42.391 17.179 40.6893 18.0819 38.9182C16.3687 38.2815 14.7133 37.4828 13.1274 36.5567C13.5442 36.2557 13.9493 35.9432 14.3429 35.6422C23.6384 40.0179 34.4039 40.0179 43.711 35.6422C44.1046 35.9663 44.5097 36.2789 44.9264 36.5567C43.3405 37.4943 41.6852 38.2815 39.9604 38.9298C40.8633 40.7009 41.9167 42.4025 43.109 44C48.3992 42.4025 53.3653 39.9137 57.7988 36.6377C59.0027 24.1358 55.7383 13.3007 49.1748 3.70429C45.3663 1.95633 41.3379 0.717706 37.2053 0.0231518L37.1937 0ZM19.3784 29.9816C16.5192 29.9816 14.1461 27.3886 14.1461 24.1821C14.1461 20.9755 16.4266 18.371 19.3669 18.371C22.3071 18.371 24.6455 20.9871 24.5992 24.1821C24.5529 27.377 22.2956 29.9816 19.3784 29.9816ZM38.6639 29.9816C35.7931 29.9816 33.4431 27.3886 33.4431 24.1821C33.4431 20.9755 35.7236 18.371 38.6639 18.371C41.6042 18.371 43.9309 20.9871 43.8846 24.1821C43.8383 27.377 41.581 29.9816 38.6639 29.9816Z"
                ></path>
              </svg>
            </button>
          )}
        </div>

        {/* copyright */}
        <div className="text-center p-4">
          {siteConfig.copyrightUrl ? (
            <Link
              href={siteConfig.copyrightUrl}
              className="text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              ©{" "}
              {siteConfig.copyright || `${currentYear} ${siteConfig.adminName}`}
            </Link>
          ) : (
            <span className="text-white">
              ©{" "}
              {siteConfig.copyright || `${currentYear} ${siteConfig.adminName}`}
            </span>
          )}
        </div>
      </div>

      {discordCopied && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded z-50">
          Discord ID copied to clipboard
        </div>
      )}
    </footer>
  );
};

export default Footer;
