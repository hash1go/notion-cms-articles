"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ImageLoadError,
  NetworkError,
  formatErrorForLogging,
} from "@/lib/errors";

interface NotionImageProps extends Omit<ImageProps, "onError"> {
  src: string | StaticImportData;
  retryLimit?: number;
  pageId?: string;
  blockId?: string;
  placeholderColor?: string;
  priority?: boolean;
  onImageError?: (error: ImageLoadError) => void;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

type StaticImportData = {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
};

// Function to create colored SVG placeholder
const createColoredPlaceholder = (color = "#E5E7EB") => {
  // Create single color SVG
  const svg = `<svg width="1" height="1" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" fill="${color}"/></svg>`;
  // Base64 encode
  return typeof window !== "undefined"
    ? `data:image/svg+xml;base64,${window.btoa(svg)}`
    : `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

// Check if Notion URL is expired
const isExpiredNotionUrl = (url: string): boolean => {
  // NotionのURLかチェック
  if (!url.includes("notion-static.com") && !url.includes("amazonaws.com"))
    return false;

  try {
    // URLのExpiresパラメータを取得
    const urlObj = new URL(url);
    const expiresStr = urlObj.searchParams.get("X-Amz-Expires");
    const dateStr = urlObj.searchParams.get("X-Amz-Date");

    if (!expiresStr || !dateStr) return true; // パラメータがない場合は期限切れとみなす

    const expires = parseInt(expiresStr);

    // X-Amz-Dateの形式は通常 YYYYMMDDTHHmmssZ
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // JavaScriptの月は0-11
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11));
    const minute = parseInt(dateStr.substring(11, 13));
    const second = parseInt(dateStr.substring(13, 15));

    const dateObj = new Date(Date.UTC(year, month, day, hour, minute, second));
    const expirationTime = dateObj.getTime() + expires * 1000;

    return Date.now() > expirationTime;
  } catch (error) {
    console.error("Error checking URL expiration:", error);
    return false; // エラーの場合は期限切れではないと仮定
  }
};

// 更新されたURLを取得
const fetchUpdatedImageUrl = async (
  oldUrl: string,
  pageId?: string,
  blockId?: string
): Promise<string> => {
  if (!pageId) return oldUrl;

  // キャッシュキーの作成
  const cacheKey = `img_${pageId}_${blockId || "cover"}`;

  // まずセッションストレージをチェック
  try {
    if (typeof window !== "undefined") {
      const cachedData = sessionStorage.getItem(cacheKey);
      const expiryStr = sessionStorage.getItem(`${cacheKey}_exp`);

      if (cachedData && expiryStr) {
        const expiryTime = parseInt(expiryStr);
        if (expiryTime > Date.now()) {
          return cachedData;
        }
      }
    }
  } catch (e) {
    // セッションストレージエラーは無視
  }

  try {
    // APIエンドポイントの準備
    let url = `/api/refreshImageUrl?pageId=${pageId}`;
    if (blockId) url += `&blockId=${blockId}`;

    // APIリクエスト実行
    const response = await fetch(url, {
      // キャッシュの最適化設定
      cache: "force-cache",
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new NetworkError(
        `Failed to refresh image URL: ${
          errorData.error || response.statusText
        }`,
        url
      );
    }

    const data = await response.json();
    const newUrl = data.url || oldUrl;

    // 新しいURLをセッションストレージにキャッシュ
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(cacheKey, newUrl);
        // 3時間の有効期限を設定
        sessionStorage.setItem(
          `${cacheKey}_exp`,
          (Date.now() + 10800000).toString()
        );
      }
    } catch (e) {
      // セッションストレージエラーは無視
    }

    return newUrl;
  } catch (error) {
    const formattedError = formatErrorForLogging(error);
    console.error("Error fetching updated image URL:", formattedError);

    // NetworkErrorの場合はそのまま再スロー
    if (error instanceof NetworkError) {
      throw error;
    }

    // その他のエラーはImageLoadErrorとして扱う
    throw new ImageLoadError(oldUrl, formattedError.message);
  }
};

const NotionImage: React.FC<NotionImageProps> = ({
  src,
  retryLimit = 3,
  pageId,
  blockId,
  placeholderColor = "#E5E7EB",
  quality = 80,
  priority = false,
  onImageError,
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | StaticImportData>(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadError, setLoadError] = useState<ImageLoadError | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const isMounted = useRef(true);
  const lastRefreshTime = useRef<number>(0);

  // コンポーネントのアンマウント時にフラグを更新
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Generate colored placeholder
  const coloredPlaceholder = createColoredPlaceholder(placeholderColor);

  // Get session storage cache key
  const getCacheKey = () => {
    if (!pageId) return null;
    return `img_${pageId}_${blockId || "cover"}`;
  };

  // Get URL from session storage
  const getCachedUrl = () => {
    const cacheKey = getCacheKey();
    if (typeof window === "undefined" || !cacheKey) return null;

    try {
      const cachedUrl = sessionStorage.getItem(cacheKey);
      const expiryStr = sessionStorage.getItem(`${cacheKey}_exp`);
      const expiryTime = expiryStr ? parseInt(expiryStr) : 0;

      if (cachedUrl && expiryTime > Date.now()) {
        return cachedUrl;
      }
    } catch (e) {
      // Ignore session storage errors
    }
    return null;
  };

  // Cache URL in session storage
  const cacheUrl = (url: string) => {
    const cacheKey = getCacheKey();
    if (typeof window === "undefined" || !cacheKey) return;

    try {
      sessionStorage.setItem(cacheKey, url);
      // Set validity period to 30 minutes
      sessionStorage.setItem(
        `${cacheKey}_exp`,
        (Date.now() + 1800000).toString()
      );
    } catch (e) {
      // Ignore session storage errors
    }
  };

  // SrcオブジェクトからURLを取得する関数
  const getUrlFromSrc = (src: string | StaticImportData): string => {
    if (typeof src === "string") return src;
    return src.src;
  };

  // Helper function to limit API requests
  const needsRefresh = () => {
    const now = Date.now();
    // Only allow refresh if at least 5 seconds have passed since last refresh
    if (now - lastRefreshTime.current > 5000) {
      lastRefreshTime.current = now;
      return true;
    }
    return false;
  };

  // Check for expired URLs on page load
  useEffect(() => {
    const checkAndUpdateUrl = async () => {
      const srcUrl = getUrlFromSrc(currentSrc);

      // 1. First check session storage
      const cachedUrl = getCachedUrl();
      if (cachedUrl) {
        setCurrentSrc(cachedUrl);
        return;
      }

      // 2. Then check if URL is expired
      if (
        isExpiredNotionUrl(srcUrl) &&
        pageId &&
        !isRetrying &&
        needsRefresh()
      ) {
        setIsRetrying(true);
        try {
          const newUrl = await fetchUpdatedImageUrl(srcUrl, pageId, blockId);
          if (newUrl !== srcUrl && isMounted.current) {
            setCurrentSrc(newUrl);
            cacheUrl(newUrl); // Cache the new URL
          }
        } catch (error) {
          const imgError =
            error instanceof ImageLoadError
              ? error
              : new ImageLoadError(srcUrl, "Failed to refresh URL on load");

          setLoadError(imgError);
          if (onImageError) onImageError(imgError);
        } finally {
          if (isMounted.current) {
            setIsRetrying(false);
          }
        }
      }
    };

    checkAndUpdateUrl();
  }, [currentSrc, pageId, blockId]);

  const handleLoad = useCallback(() => {
    // 画像が正常に読み込まれた場合、現在のURLをキャッシュ
    const srcUrl = getUrlFromSrc(currentSrc);
    cacheUrl(srcUrl);
    setLoadError(null);
    setShowFallback(false);
  }, [currentSrc]);

  const handleError = useCallback(
    async (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      // 親コンポーネントのonErrorハンドラーを呼び出す
      if (onError) {
        onError(event);
      }

      const srcUrl = getUrlFromSrc(currentSrc);

      if (
        retryCount < retryLimit &&
        pageId &&
        !isRetrying &&
        needsRefresh() &&
        isMounted.current
      ) {
        setIsRetrying(true);
        setRetryCount((prev) => prev + 1);

        try {
          // 遅延を追加してリクエスト制限を回避
          await new Promise((resolve) =>
            setTimeout(resolve, 300 * (retryCount + 1))
          );

          const newUrl = await fetchUpdatedImageUrl(srcUrl, pageId, blockId);

          if (newUrl !== srcUrl && isMounted.current) {
            setCurrentSrc(newUrl);
            cacheUrl(newUrl);
          }
        } catch (error) {
          const imgError =
            error instanceof ImageLoadError
              ? error
              : new ImageLoadError(
                  srcUrl,
                  `Failed to load after ${retryCount + 1} attempts`
                );

          setLoadError(imgError);
          setShowFallback(true);
          if (onImageError) onImageError(imgError);
        } finally {
          if (isMounted.current) {
            setIsRetrying(false);
          }
        }
      } else {
        // リトライ限界に達した場合
        const imgError = new ImageLoadError(
          srcUrl,
          `Failed to load after ${retryLimit} attempts`
        );
        setLoadError(imgError);
        setShowFallback(true);
        if (onImageError) onImageError(imgError);
      }
    },
    [
      currentSrc,
      retryCount,
      retryLimit,
      pageId,
      blockId,
      isRetrying,
      onError,
      onImageError,
    ]
  );

  // レスポンシブサイズを適切に設定
  const getSizes = () => {
    if (props.fill) {
      return "(max-width: 480px) 100vw, (max-width: 640px) 95vw, (max-width: 768px) 85vw, (max-width: 1024px) 75vw, (max-width: 1280px) 65vw, 1200px";
    }
    return props.sizes || "100vw";
  };

  // エラー時のフォールバックUI
  if (showFallback) {
    return (
      <div className="relative w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-500">画像を読み込めませんでした</p>
          {retryCount < retryLimit && (
            <button
              onClick={() => {
                setShowFallback(false);
                setRetryCount(0);
                // ダミーのイベントオブジェクトを作成して handleError を呼び出す
                const dummyEvent = new Event("error") as any;
                handleError(dummyEvent);
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        {...props}
        src={currentSrc}
        onLoad={handleLoad}
        onError={handleError}
        quality={quality}
        placeholder="blur"
        blurDataURL={coloredPlaceholder}
        loading={priority ? "eager" : "lazy"}
        sizes={getSizes()}
        decoding="async"
      />
      {isRetrying && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      )}
    </div>
  );
};

export default NotionImage;
