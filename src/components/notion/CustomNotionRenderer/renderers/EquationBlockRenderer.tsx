import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { isEquationBlock } from "@/types/notion-api";

type EquationBlockRendererProps = {
  // 注意: notion-block-rendererとの型の互換性のため、意図的にany型を使用
  block: any;
  inline?: boolean;
};

export const EquationBlockRenderer: React.FC<EquationBlockRendererProps> = ({
  block,
  inline = false,
}) => {
  // 型の安全性を確保
  if (!isEquationBlock(block)) {
    console.error("Block is not an equation block", block);
    return null;
  }

  const expression = block.equation.expression;

  try {
    if (inline) {
      return <InlineMath math={expression} />;
    } else {
      return (
        <div className="nbr-block-equation">
          <div className="my-4 flex justify-center">
            <BlockMath math={expression} />
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error("Error rendering equation:", error);
    return (
      <div className="text-red-500">
        {inline ? (
          <span>Error rendering equation: {expression}</span>
        ) : (
          <div>Error rendering equation: {expression}</div>
        )}
      </div>
    );
  }
};
