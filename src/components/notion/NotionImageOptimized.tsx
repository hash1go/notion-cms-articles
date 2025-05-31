"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ImageLoadError,
  NetworkError,
  formatErrorForLogging,
} from "@/lib/errors";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import {
  calculateImagePriority,
  PerformanceMonitor,
} from "@/lib/utils/performanceUtils";

interface NotionImageOptimizedProps extends Omit<ImageProps, "onError"> {
  src: string | StaticImportData;
  retryLimit?: number;
  pageId?: string;
  blockId?: string;
  placeholderColor?: string;
  priority?: boolean;
  onImageError?: (error: ImageLoadError) => void;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  index?: number; // 画像のインデックス（優先度計算用）
}

type StaticImportData = {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
};

// パフォーマンスモニター（シングルトン）
const perfMonitor = new PerformanceMonitor();

// Function to create colored SVG placeholder
const createColoredPlaceholder = (color = "#E5E7EB") => {
  const svg = `<svg width="1" height="1" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" fill="${color}"/></svg>`;
  return typeof window !== "undefined"
    ? `data:image/svg+xml;base64,${window.btoa(svg)}`
    : `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

// Check if Notion URL is expired
const isExpiredNotionUrl = (url: string): boolean => {
  if (!url.includes("notion-static.com") && !url.includes("amazonaws.com"))
    return false;

  try {
    const urlObj = new URL(url);
    const expiresStr = urlObj.searchParams.get("X-Amz-Expires");
    const dateStr = urlObj.searchParams.get("X-Amz-Date");

    if (!expiresStr || !dateStr) return true;

    const expires = parseInt(expiresStr);
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11));
    const minute = parseInt(dateStr.substring(11, 13));
    const second = parseInt(dateStr.substring(13, 15));

    const dateObj = new Date(Date.UTC(year, month, day, hour, minute, second));
    const expirationTime = dateObj.getTime() + expires * 1000;

    return Date.now() > expirationTime;
  } catch (error) {
    console.error("Error checking URL expiration:", error);
    return false;
  }
};

// 更新されたURLを取得（メモ化された関数）
const fetchUpdatedImageUrl = async (
  oldUrl: string,
  pageId?: string,
  blockId?: string
): Promise<string> => {
  if (!pageId) return oldUrl;

  const cacheKey = `img_${pageId}_${blockId || "cover"}`;

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
    let url = `/api/refreshImageUrl?pageId=${pageId}`;
    if (blockId) url += `&blockId=${blockId}`;

    const response = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 3600 },
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

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(cacheKey, newUrl);
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

    if (error instanceof NetworkError) {
      throw error;
    }

    throw new ImageLoadError(oldUrl, formattedError.message);
  }
};

const NotionImageOptimized: React.FC<NotionImageOptimizedProps> = ({
  src,
  retryLimit = 3,
  pageId,
  blockId,
  placeholderColor = "#E5E7EB",
  quality = 80,
  priority: explicitPriority = false,
  onImageError,
  onError,
  index = 0,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | StaticImportData>(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadError, setLoadError] = useState<ImageLoadError | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const isMounted = useRef(true);
  const lastRefreshTime = useRef<number>(0);
  const loadStartTime = useRef<number>(0);

  // Intersection Observer を使用してビューポート内かどうかを検出
  const [containerRef, isInViewport] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
    freezeOnceVisible: true,
  }) as [
    React.RefObject<HTMLDivElement>,
    boolean,
    IntersectionObserverEntry | undefined
  ];

  // 画像の優先度を計算
  const priority = useMemo(() => {
    if (explicitPriority) return true;

    // ビューポート内の画像、または最初の数枚は優先的に読み込む
    return isInViewport || index < 4;
  }, [explicitPriority, isInViewport, index]);

  // 画像のロード設定
  const loading = priority ? "eager" : "lazy";

  // Generate colored placeholder
  const coloredPlaceholder = useMemo(
    () => createColoredPlaceholder(placeholderColor),
    [placeholderColor]
  );

  // Get session storage cache key
  const getCacheKey = useCallback(() => {
    if (!pageId) return null;
    return `img_${pageId}_${blockId || "cover"}`;
  }, [pageId, blockId]);

  // Get URL from session storage
  const getCachedUrl = useCallback(() => {
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
  }, [getCacheKey]);

  // Cache URL in session storage
  const cacheUrl = useCallback(
    (url: string) => {
      const cacheKey = getCacheKey();
      if (typeof window === "undefined" || !cacheKey) return;

      try {
        sessionStorage.setItem(cacheKey, url);
        sessionStorage.setItem(
          `${cacheKey}_exp`,
          (Date.now() + 1800000).toString()
        );
      } catch (e) {
        // Ignore session storage errors
      }
    },
    [getCacheKey]
  );

  // SrcオブジェクトからURLを取得する関数
  const getUrlFromSrc = useCallback(
    (src: string | StaticImportData): string => {
      if (typeof src === "string") return src;
      return src.src;
    },
    []
  );

  // Helper function to limit API requests
  const needsRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshTime.current > 5000) {
      lastRefreshTime.current = now;
      return true;
    }
    return false;
  }, []);

  // Check for expired URLs on page load (ビューポート内の画像のみ)
  useEffect(() => {
    if (!isInViewport && !priority) return;

    const checkAndUpdateUrl = async () => {
      const srcUrl = getUrlFromSrc(currentSrc);

      const cachedUrl = getCachedUrl();
      if (cachedUrl) {
        setCurrentSrc(cachedUrl);
        return;
      }

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
            cacheUrl(newUrl);
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
  }, [
    currentSrc,
    pageId,
    blockId,
    isInViewport,
    priority,
    getCachedUrl,
    getUrlFromSrc,
    needsRefresh,
    cacheUrl,
    onImageError,
  ]);

  const handleLoad = useCallback(() => {
    const srcUrl = getUrlFromSrc(currentSrc);
    cacheUrl(srcUrl);
    setLoadError(null);
    setShowFallback(false);
    setHasLoaded(true);

    // パフォーマンス測定
    if (loadStartTime.current > 0 && process.env.NODE_ENV === "development") {
      const loadTime = performance.now() - loadStartTime.current;
      perfMonitor.mark(`image-loaded-${blockId || pageId}`);
      console.debug(`Image loaded in ${loadTime.toFixed(2)}ms`, {
        src: srcUrl.substring(0, 50) + "...",
        priority,
        viewport: isInViewport,
      });
    }
  }, [
    currentSrc,
    blockId,
    pageId,
    priority,
    isInViewport,
    cacheUrl,
    getUrlFromSrc,
  ]);

  const handleError = useCallback(
    async (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
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
      needsRefresh,
      cacheUrl,
      getUrlFromSrc,
    ]
  );

  // レスポンシブサイズを適切に設定
  const getSizes = useCallback(() => {
    if (props.fill) {
      return "(max-width: 480px) 100vw, (max-width: 640px) 95vw, (max-width: 768px) 85vw, (max-width: 1024px) 75vw, (max-width: 1280px) 65vw, 1200px";
    }
    return props.sizes || "100vw";
  }, [props.fill, props.sizes]);

  // コンポーネントのアンマウント時にフラグを更新
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 画像読み込み開始時刻を記録
  useEffect(() => {
    if (isInViewport && !hasLoaded) {
      loadStartTime.current = performance.now();
    }
  }, [isInViewport, hasLoaded]);

  // エラー時のフォールバックUI
  if (showFallback) {
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full bg-gray-100 rounded-lg flex items-center justify-center"
      >
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
    <div ref={containerRef} className="relative w-full h-full">
      {/* ビューポート外の画像はプレースホルダーのみ表示 */}
      {!isInViewport && !priority ? (
        <div
          className="w-full h-full bg-gray-200 rounded-lg animate-pulse"
          style={{
            aspectRatio:
              props.width && props.height
                ? `${props.width}/${props.height}`
                : "auto",
          }}
        />
      ) : (
        <>
          <Image
            {...props}
            src={currentSrc}
            onLoad={handleLoad}
            onError={handleError}
            quality={quality}
            placeholder="blur"
            blurDataURL={coloredPlaceholder}
            loading={loading}
            priority={priority}
            sizes={getSizes()}
            decoding="async"
          />
          {isRetrying && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotionImageOptimized;
