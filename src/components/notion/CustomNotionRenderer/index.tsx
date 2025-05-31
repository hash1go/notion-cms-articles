"use client";

import React, { useEffect, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import NotionBlocks from "notion-block-renderer";
import { blockTypeGuards } from "./utils";
import { DividerBlockRenderer } from "./renderers/DividerBlockRenderer";
import LinkInterceptor from "./LinkInterceptor";
import { formatErrorForLogging } from "@/lib/errors";
import { usePreloadDetection } from "@/hooks/usePreloadDetection";
import { preloadSelectors, PerformanceMonitor } from "@/lib/utils/performanceUtils";

// パフォーマンスモニター
const perfMonitor = new PerformanceMonitor();

// エラーフォールバックコンポーネント
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-800">このブロックの表示中にエラーが発生しました。</p>
    {process.env.NODE_ENV === "development" && (
      <pre className="mt-2 text-xs text-red-600">{error.message}</pre>
    )}
  </div>
);

// 遅延読み込みコンポーネントのプリロード関数
const preloadMathComponents = () => {
  return Promise.all([
    import("./renderers/EquationBlockRenderer"),
    import("./renderers/MathAwareParagraphRenderer"),
  ]);
};

const preloadImageComponent = () => {
  return import("./renderers/ImageBlockRendererOptimized");
};

// 最適化された画像レンダラー（遅延読み込み）
const ImageBlockRendererOptimized = dynamic(
  () =>
    import("./renderers/ImageBlockRendererOptimized").then(
      (mod) => mod.ImageBlockRendererOptimized
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
    ),
  }
);

// 数式レンダラー（プリロード対応）
const EquationBlockRenderer = dynamic(
  () =>
    import("./renderers/EquationBlockRenderer").then(
      (mod) => mod.EquationBlockRenderer
    ),
  {
    ssr: false,
    loading: () => <div className="h-12 bg-gray-100 animate-pulse rounded" />,
  }
);

const MathAwareParagraphRenderer = dynamic(
  () =>
    import("./renderers/MathAwareParagraphRenderer").then(
      (mod) => mod.MathAwareParagraphRenderer
    ),
  {
    ssr: false,
    loading: () => <div className="h-6 bg-gray-100 animate-pulse rounded" />,
  }
);

type CustomNotionRendererProps = {
  blocks: any[];
  isCodeHighlighter?: boolean;
  customRenderers?: {
    image?: boolean;
    divider?: boolean;
    equation?: boolean;
    paragraph?: boolean;
    link?: boolean;
  };
};

interface CustomBlockInfo {
  index: number;
  type: string;
}

// ブロックに数式が含まれているかを事前にチェック
function containsMathBlocks(blocks: any[]): boolean {
  return blocks.some(
    (block) =>
      blockTypeGuards.isEquationBlock(block) ||
      blockTypeGuards.isParagraphWithMath(block)
  );
}

// ブロックに画像が含まれているかを事前にチェック
function containsImageBlocks(blocks: any[]): boolean {
  return blocks.some((block) => blockTypeGuards.isImageBlock(block));
}

const CustomNotionRenderer: React.FC<CustomNotionRendererProps> = ({
  blocks,
  isCodeHighlighter = false,
  customRenderers = {
    image: true,
    divider: true,
    equation: true,
    paragraph: true,
    link: true,
  },
}) => {
  // パフォーマンス測定開始
  useEffect(() => {
    perfMonitor.mark("notion-renderer-start");

    return () => {
      perfMonitor.measure("notion-renderer-total", "notion-renderer-start");
    };
  }, []);

  // プリロード設定
  const preloadConfigs = useMemo(() => {
    const configs = [];

    // 数式コンポーネントのプリロード設定
    if (customRenderers.equation && containsMathBlocks(blocks)) {
      configs.push({
        selector: "body", // すぐにプリロード開始
        preloadFn: preloadMathComponents,
        delay: 100,
      });
    }

    // 画像コンポーネントのプリロード設定
    if (customRenderers.image && containsImageBlocks(blocks)) {
      configs.push({
        selector: "body",
        preloadFn: preloadImageComponent,
        delay: 200,
      });
    }

    return configs;
  }, [blocks, customRenderers]);

  // プリロード実行
  usePreloadDetection(preloadConfigs);

  // ブロックの事前解析（メモ化）
  const processedBlocks = useMemo(() => {
    if (!blocks || !Array.isArray(blocks)) {
      console.error("Invalid blocks array", blocks);
      return { customBlocks: [], hasContent: false };
    }

    if (blocks.length === 0) {
      return { customBlocks: [], hasContent: false };
    }

    const customBlocks: CustomBlockInfo[] = [];

    blocks.forEach((block, index) => {
      if (customRenderers.image && blockTypeGuards.isImageBlock(block)) {
        customBlocks.push({ index, type: "image" });
      } else if (
        customRenderers.divider &&
        blockTypeGuards.isDividerBlock(block)
      ) {
        customBlocks.push({ index, type: "divider" });
      } else if (
        customRenderers.equation &&
        blockTypeGuards.isEquationBlock(block)
      ) {
        customBlocks.push({ index, type: "equation" });
      } else if (
        customRenderers.paragraph &&
        blockTypeGuards.isParagraphWithMath(block)
      ) {
        customBlocks.push({ index, type: "paragraph" });
      }
    });

    return { customBlocks, hasContent: true };
  }, [blocks, customRenderers]);

  if (!processedBlocks.hasContent) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>表示するコンテンツがありません。</p>
      </div>
    );
  }

  try {
    const customBlockTypes = Object.entries(customRenderers)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type);

    let processedContent;

    if (
      processedBlocks.customBlocks.length === 0 ||
      (customBlockTypes.length === 1 && customBlockTypes[0] === "link")
    ) {
      processedContent = (
        <NotionBlocks
          blocks={blocks as any}
          isCodeHighlighter={isCodeHighlighter}
        />
      );
    } else {
      const renderedContent: React.ReactNode[] = [];
      let lastProcessedIndex = 0;

      // カスタムレンダラーのマッピング（最適化版）
      const renderBlock = (
        block: any,
        type: string,
        blockIndex: number
      ): React.ReactNode => {
        try {
          const customElement = (() => {
            switch (type) {
              case "image":
                return (
                  <Suspense
                    key={`inner-${block.id}`}
                    fallback={
                      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
                    }
                  >
                    <ImageBlockRendererOptimized
                      block={block}
                      index={blockIndex}
                    />
                  </Suspense>
                );
              case "divider":
                return (
                  <DividerBlockRenderer
                    key={`inner-${block.id}`}
                    block={block}
                  />
                );
              case "equation":
                return (
                  <Suspense
                    key={`inner-${block.id}`}
                    fallback={
                      <div className="h-12 bg-gray-100 animate-pulse rounded" />
                    }
                  >
                    <div data-contains-math="true">
                      <EquationBlockRenderer block={block} />
                    </div>
                  </Suspense>
                );
              case "paragraph":
                return (
                  <Suspense
                    key={`inner-${block.id}`}
                    fallback={
                      <div className="h-6 bg-gray-100 animate-pulse rounded" />
                    }
                  >
                    <div data-contains-math="true">
                      <MathAwareParagraphRenderer block={block} />
                    </div>
                  </Suspense>
                );
              default:
                console.warn(
                  `No renderer found for custom block type: ${type}`
                );
                return null;
            }
          })();

          return customElement ? (
            <div key={`wrapper-${block.id}`} className="nbr-blocks">
              {customElement}
            </div>
          ) : null;
        } catch (error) {
          const formattedError = formatErrorForLogging(error);
          console.error(`Error rendering ${type} block:`, formattedError);

          return (
            <div key={`error-${block.id}`} className="nbr-blocks">
              <ErrorFallback error={error as Error} />
            </div>
          );
        }
      };

      processedBlocks.customBlocks
        .sort((a, b) => a.index - b.index)
        .forEach(({ index, type }) => {
          if (index > lastProcessedIndex) {
            const blocksBefore = blocks.slice(lastProcessedIndex, index);
            if (blocksBefore.length > 0) {
              renderedContent.push(
                <NotionBlocks
                  key={`blocks-${lastProcessedIndex}-${index}`}
                  blocks={blocksBefore as any}
                  isCodeHighlighter={isCodeHighlighter}
                />
              );
            }
          }

          const customBlock = blocks[index];
          const customElement = renderBlock(customBlock, type, index);
          if (customElement) {
            renderedContent.push(customElement);
          }

          lastProcessedIndex = index + 1;
        });

      if (lastProcessedIndex < blocks.length) {
        const blocksAfter = blocks.slice(lastProcessedIndex);
        if (blocksAfter.length > 0) {
          renderedContent.push(
            <NotionBlocks
              key={`blocks-${lastProcessedIndex}-end`}
              blocks={blocksAfter as any}
              isCodeHighlighter={isCodeHighlighter}
            />
          );
        }
      }

      processedContent = <>{renderedContent}</>;
    }

    // LinkInterceptorを使う前に、ブロックに実際にリンクがあるかを判定（最適化）
    const hasExternalLinks = useMemo(() => {
      return (
        processedBlocks.customBlocks.length > 0 ||
        customRenderers.link === true ||
        blocks.some((block) => {
          // リンクを含む可能性のあるブロックタイプをチェック
          if (blockTypeGuards.hasLinkInParagraph(block)) return true;
          if (blockTypeGuards.hasLinkInBulletedList(block)) return true;
          if (blockTypeGuards.hasLinkInNumberedList(block)) return true;
          return false;
        })
      );
    }, [blocks, processedBlocks.customBlocks, customRenderers.link]);

    let finalContent = processedContent;

    // リンクがある場合のみLinkInterceptorを使用
    if (hasExternalLinks) {
      finalContent = (
        <Suspense fallback={processedContent}>
          <LinkInterceptor>{processedContent}</LinkInterceptor>
        </Suspense>
      );
    }

    return finalContent;
  } catch (error) {
    const formattedError = formatErrorForLogging(error);
    console.error("Error in CustomNotionRenderer:", formattedError);

    // フォールバックとして通常のNotionBlocksを使用
    return (
      <div>
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            一部のコンテンツの表示に問題が発生しました。基本的な表示モードで表示しています。
          </p>
        </div>
        <NotionBlocks
          blocks={blocks as any}
          isCodeHighlighter={isCodeHighlighter}
        />
      </div>
    );
  }
};

export default CustomNotionRenderer;
