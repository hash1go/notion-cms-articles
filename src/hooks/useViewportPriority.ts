import { useState, useEffect } from "react";

interface ViewportPriority {
  priority: boolean;
  distance: number;
}

export function useViewportPriority(threshold: number = 1.5): ViewportPriority {
  const [priority, setPriority] = useState(false);
  const [distance, setDistance] = useState(Infinity);

  useEffect(() => {
    const calculateDistance = () => {
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // 現在のビューポートの中心からの距離を計算
      const viewportCenter = scrollY + viewportHeight / 2;

      // 要素の位置はコンポーネント内で計算される必要があるため、
      // ここでは基本的なビューポート情報のみを提供
      return {
        viewportHeight,
        scrollY,
        viewportCenter,
      };
    };

    const handleScroll = () => {
      const { viewportHeight } = calculateDistance();
      // スクロール位置に基づいて優先度を決定
      setPriority(distance < viewportHeight * threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [distance, threshold]);

  return { priority, distance };
}
