"use client";

import React, { useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import NotionBlocks from "notion-block-renderer";
import "katex/dist/katex.min.css";
import { isParagraphBlock, NotionRichText } from "@/types/notion-api";

// 数式コンポーネントを動的インポート
const MathEquation = dynamic(() => import("./MathEquation"), {
  ssr: false,
});

// EquationBlockRendererはブロック数式用、MathEquationはインライン数式用

type MathAwareParagraphRendererProps = {
  // 注意: notion-block-rendererとの型の互換性のため、意図的にany型を使用
  block: any;
};

export const MathAwareParagraphRenderer: React.FC<
  MathAwareParagraphRendererProps
> = ({ block }) => {
  // 数式のデータ構造を事前に構築
  const mathContent = useMemo(() => {
    if (!isParagraphBlock(block)) {
      return null;
    }

    const richText = block.paragraph.rich_text;
    // インライン数式を含むかチェック
    const hasMathEquation = richText.some(
      (textBlock: NotionRichText) =>
        textBlock.type === "equation" && textBlock.equation !== undefined
    );

    if (!hasMathEquation) return null;

    return richText;
  }, [block]);

  if (!mathContent) {
    // 通常の段落として処理
    // 注意: notion-block-rendererへの型アサーション
    return <NotionBlocks blocks={[block] as any} />;
  }

  return (
    <div className="nbr-block-p">
      <p className="font-normal leading-relaxed text-base text-gray-800 mt-0 mb-4">
        {mathContent.map((textBlock: NotionRichText, index: number) => {
          // 数式ブロックの場合（type: equation）
          if (textBlock.type === "equation" && textBlock.equation) {
            return (
              <Suspense
                key={index}
                fallback={
                  <span className="bg-gray-100 px-2 py-1 rounded inline-block">
                    {textBlock.plain_text}
                  </span>
                }
              >
                <MathEquation expression={textBlock.equation.expression} />
              </Suspense>
            );
          }

          // 数式以外のテキストは通常の表示
          return <span key={index}>{textBlock.plain_text}</span>;
        })}
      </p>
    </div>
  );
};
