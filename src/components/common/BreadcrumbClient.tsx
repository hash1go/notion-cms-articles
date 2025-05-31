"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

// 言語に依存するラベルを定義
const labels = {
  home: "Home",
  breadcrumbAriaLabel: "Breadcrumb",
};

const BreadcrumbClient = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみ実行するためのフラグ
  useEffect(() => {
    setMounted(true);
  }, []);

  // pathnameがnullの場合の処理を追加
  if (pathname === null) {
    return null; // または適切なフォールバックUIを返す
  }

  let joinedPath = "";

  // パスの分割と整形
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  // JSON-LDデータの生成 - クライアントサイドでのみ
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: labels.home,
        item:
          typeof window !== "undefined" ? `${window.location.origin}/` : "/",
      },
      ...pathSegments.map((path, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: decodeURIComponent(path),
        item:
          typeof window !== "undefined"
            ? `${window.location.origin}/${pathSegments
                .slice(0, index + 1)
                .join("/")}`
            : `/${pathSegments.slice(0, index + 1).join("/")}`,
      })),
    ],
  };

  return (
    <nav
      aria-label={labels.breadcrumbAriaLabel}
      className="text-xs md:text-sm w-full overflow-x-auto"
    >
      {/* Schema.org用の構造化データ - クライアントサイドでのみレンダリング */}
      {mounted && (
        <Script
          id="breadcrumb-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
          strategy="afterInteractive"
        />
      )}

      {/* 視覚的なパンくずリスト */}
      <ol className="flex items-center whitespace-nowrap">
        <li className="flex items-center flex-shrink-0">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <span>{labels.home}</span>
          </Link>
          {pathSegments.length > 0 && (
            <span className="text-gray-500 mx-1">/</span>
          )}
        </li>

        {pathSegments.map((path, index) => {
          joinedPath += `/${path}`;
          const isLastItem = index === pathSegments.length - 1;
          const isNonLinkableSection = path === "articles" || path === "tags";
          const isFirstSegmentAndNonLinkable =
            index === 0 && isNonLinkableSection;

          return (
            <li
              key={index}
              className={`flex items-center ${
                isLastItem ? "overflow-hidden text-ellipsis" : "flex-shrink-0"
              }`}
            >
              {isLastItem ? (
                <span className="text-gray-600 font-medium overflow-hidden text-ellipsis">
                  {decodeURIComponent(path)}
                </span>
              ) : isFirstSegmentAndNonLinkable ? (
                <span className="text-gray-600">
                  {decodeURIComponent(path)}
                </span>
              ) : (
                <Link
                  href={joinedPath}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <span>{decodeURIComponent(path)}</span>
                </Link>
              )}
              {!isLastItem && <span className="text-gray-500 mx-1">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbClient;
