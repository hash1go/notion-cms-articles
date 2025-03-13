"use client";

import React, { useEffect, useRef } from "react";

const LinkInterceptor: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current || processedRef.current) return;

    // 低優先度の処理としてスケジュール
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;

      // リンクを検索
      const links = containerRef.current.querySelectorAll("a");
      if (links.length === 0) return;

      // 処理を複数のチャンクに分割して実行
      const processLinksInChunks = (
        linksArr: HTMLAnchorElement[],
        chunkSize = 20
      ) => {
        let i = 0;
        const currentHostname = window.location.hostname;

        const processNextChunk = () => {
          const end = Math.min(i + chunkSize, linksArr.length);
          let modifiedInChunk = 0;

          for (; i < end; i++) {
            const link = linksArr[i];
            try {
              if (
                link.href &&
                !link.href.startsWith("javascript:") &&
                !link.hasAttribute("target")
              ) {
                const url = new URL(link.href, window.location.href);
                if (url.hostname !== currentHostname) {
                  link.setAttribute("target", "_blank");
                  link.setAttribute("rel", "noopener noreferrer");
                  modifiedInChunk++;
                }
              }
            } catch (e) {
              // URLの解析に失敗した場合は処理しない
            }
          }

          // まだ処理するリンクが残っていれば次のチャンクを処理
          if (i < linksArr.length) {
            setTimeout(processNextChunk, 0);
          }
        };

        processNextChunk();
      };

      processLinksInChunks(Array.from(links));
      processedRef.current = true;
    }, 100); // ページ表示後少し遅らせて実行

    return () => {
      clearTimeout(timeoutId);
    };
  }, [children]);

  return <div ref={containerRef}>{children}</div>;
};

export default LinkInterceptor;
