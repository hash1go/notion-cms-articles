import { useEffect, useState } from "react";

interface PreloadConfig {
  selector: string;
  preloadFn: () => Promise<any>;
  delay?: number;
}

export function usePreloadDetection(configs: PreloadConfig[]) {
  const [preloaded, setPreloaded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const detectAndPreload = async () => {
      for (const config of configs) {
        const { selector, preloadFn, delay = 0 } = config;

        // セレクターに一致する要素が存在するかチェック
        const elements = document.querySelectorAll(selector);

        if (elements.length > 0 && !preloaded.has(selector)) {
          // 遅延を設定してプリロード
          setTimeout(async () => {
            try {
              await preloadFn();
              setPreloaded((prev) => new Set([...prev, selector]));
              if (process.env.NODE_ENV === "development") {
                console.log(`Preloaded components for selector: ${selector}`);
              }
            } catch (error) {
              console.error(
                `Failed to preload for selector ${selector}:`,
                error
              );
            }
          }, delay);
        }
      }
    };

    // 初期ロード時とDOM変更時に検出を実行
    detectAndPreload();

    // MutationObserverで動的なコンテンツ変更を監視
    const observer = new MutationObserver(() => {
      detectAndPreload();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [configs, preloaded]);

  return preloaded;
}
