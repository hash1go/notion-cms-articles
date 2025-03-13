"use client";

import React from "react";
import dynamic from "next/dynamic";
import NotionBlocks from "notion-block-renderer";
import { blockTypeGuards } from "./utils";
import { ImageBlockRenderer } from "./renderers/ImageBlockRenderer";
import { DividerBlockRenderer } from "./renderers/DividerBlockRenderer";
import LinkInterceptor from "./LinkInterceptor";

const EquationBlockRenderer = dynamic(
  () =>
    import("./renderers/EquationBlockRenderer").then(
      (mod) => mod.EquationBlockRenderer
    ),
  { ssr: false }
);

const MathAwareParagraphRenderer = dynamic(
  () =>
    import("./renderers/MathAwareParagraphRenderer").then(
      (mod) => mod.MathAwareParagraphRenderer
    ),
  { ssr: false }
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
  if (!blocks || !Array.isArray(blocks)) {
    console.error("Invalid blocks array", blocks);
    return null;
  }

  // 処理するカスタムブロックタイプを特定
  const customBlockTypes = Object.entries(customRenderers)
    .filter(([_, enabled]) => enabled)
    .map(([type]) => type);

  // カスタムレンダラーを適用するブロックと通常のブロックを分類
  const customBlocks: { index: number; type: string }[] = [];

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
      block.type === "paragraph" &&
      block.paragraph &&
      block.paragraph.rich_text
    ) {
      const hasInlineMath = block.paragraph.rich_text.some(
        (textBlock: any) => textBlock.type === "equation" && textBlock.equation
      );
      if (hasInlineMath) {
        customBlocks.push({ index, type: "paragraph" });
      }
    }
  });

  let processedContent;

  if (
    customBlocks.length === 0 ||
    (customBlockTypes.length === 1 && customBlockTypes[0] === "link")
  ) {
    processedContent = (
      <NotionBlocks blocks={blocks} isCodeHighlighter={isCodeHighlighter} />
    );
  } else {
    const renderedContent: React.ReactNode[] = [];
    let lastProcessedIndex = 0;

    // 各カスタムブロックを適切なレンダラーにマッピング
    const renderBlock = (block: any, type: string): React.ReactNode => {
      const customElement = (() => {
        switch (type) {
          case "image":
            return (
              <ImageBlockRenderer key={`inner-${block.id}`} block={block} />
            );
          case "divider":
            return (
              <DividerBlockRenderer key={`inner-${block.id}`} block={block} />
            );
          case "equation":
            return (
              <EquationBlockRenderer key={`inner-${block.id}`} block={block} />
            );
          case "paragraph":
            return (
              <MathAwareParagraphRenderer
                key={`inner-${block.id}`}
                block={block}
              />
            );
          default:
            console.warn(`No renderer found for custom block type: ${type}`);
            return null;
        }
      })();

      // カスタムブロックをNotionBlocksと同じ階層になるようにdiv.nbr-blocksで囲む
      return customElement ? (
        <div key={`wrapper-${block.id}`} className="nbr-blocks">
          {customElement}
        </div>
      ) : null;
    };

    customBlocks
      .sort((a, b) => a.index - b.index)
      .forEach(({ index, type }) => {
        if (index > lastProcessedIndex) {
          const blocksBefore = blocks.slice(lastProcessedIndex, index);
          if (blocksBefore.length > 0) {
            renderedContent.push(
              <NotionBlocks
                key={`blocks-${lastProcessedIndex}-${index}`}
                blocks={blocksBefore}
                isCodeHighlighter={isCodeHighlighter}
              />
            );
          }
        }

        const customBlock = blocks[index];
        const customElement = renderBlock(customBlock, type);
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
            blocks={blocksAfter}
            isCodeHighlighter={isCodeHighlighter}
          />
        );
      }
    }

    processedContent = <>{renderedContent}</>;
  }

  // LinkInterceptorを使う前に、ブロックに実際にリンクがあるかを判定する関数
  const hasExternalLinks = (content: React.ReactNode): boolean => {
    // 単純化した判定（実際には精度が必要なら改良が必要）
    // カスタムタイプを持つブロックがあればリンクの可能性あり
    return customBlocks.length > 0 || customRenderers.link === true;
  };

  let finalContent = processedContent;

  // リンクがあると思われる場合のみLinkInterceptorを使用
  if (hasExternalLinks(processedContent) || customRenderers.link === true) {
    finalContent = <LinkInterceptor>{processedContent}</LinkInterceptor>;
  }

  return finalContent;
};

export default CustomNotionRenderer;
