export const performanceConfig = {
  image: {
    // ビューポートの何倍の距離から画像を読み込み始めるか
    loadDistance: 1.5,
    // プレースホルダーのぼかし効果の強さ
    placeholderBlur: 20,
    // 画像読み込みのデバウンス時間（ミリ秒）
    loadDebounce: 50,
  },
  preload: {
    // 数式コンポーネントのプリロード遅延（ミリ秒）
    mathDelay: 100,
    // コードハイライターのプリロード遅延（ミリ秒）
    codeDelay: 200,
  },
};

// 画像の優先度を計算するユーティリティ
export function calculateImagePriority(
  index: number,
  isInViewport: boolean,
  viewportDistance: number
): boolean {
  // ビューポート内の画像は常に優先
  if (isInViewport) return true;

  // 最初の3枚の画像は優先
  if (index < 3) return true;

  // ビューポートから1.5画面分以内の画像は優先
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 1000;
  if (viewportDistance < viewportHeight * 1.5) return true;

  return false;
}

// プリロード対象を検出するためのセレクター設定
export const preloadSelectors = {
  math: '[data-contains-math="true"]',
  equation: ".nbr-block-equation",
  code: ".nbr-block-code",
  image: ".nbr-block-image",
};

// パフォーマンス測定ユーティリティ
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private enabled: boolean = process.env.NODE_ENV === "development";

  mark(name: string) {
    if (this.enabled && typeof window !== "undefined" && window.performance) {
      window.performance.mark(name);
      this.marks.set(name, performance.now());
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    if (this.enabled && typeof window !== "undefined" && window.performance) {
      try {
        window.performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`Performance [${name}]: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      } catch (error) {
        console.error("Performance measurement error:", error);
      }
    }
    return null;
  }

  logResourceTimings() {
    if (this.enabled && typeof window !== "undefined" && window.performance) {
      const resources = performance.getEntriesByType("resource");
      const imageResources = resources.filter(
        (r) =>
          r.name.includes(".jpg") ||
          r.name.includes(".png") ||
          r.name.includes(".webp")
      );

      console.log(
        "Image Loading Performance:",
        imageResources.map((r) => ({
          url: r.name.split("/").pop(),
          duration: r.duration.toFixed(2) + "ms",
          size: (r as any).transferSize || "unknown",
        }))
      );
    }
  }
}
