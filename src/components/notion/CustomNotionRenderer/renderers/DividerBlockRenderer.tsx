import React from "react";
import { isDividerBlock } from "@/types/notion-api";

type DividerBlockRendererProps = {
  // 注意: notion-block-rendererとの型の互換性のため、意図的にany型を使用
  block: any;
};

export const DividerBlockRenderer: React.FC<DividerBlockRendererProps> = ({
  block,
}) => {
  // 型の安全性を確保
  if (!isDividerBlock(block)) {
    console.warn("Block is not a divider block", block);
    return null;
  }

  return (
    <div className="nbr-block-divider">
      <div className="my-6">
        <hr className="border-t border-gray-300" />
      </div>
    </div>
  );
};
