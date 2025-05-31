import React from "react";
import NotionImage from "@/components/notion/NotionImage";
import { getParentId } from "../utils";
import { isImageBlock, NotionRichText } from "@/types/notion-api";

type ImageBlockRendererProps = {
  // 注意: notion-block-rendererとの型の互換性のため、意図的にany型を使用
  block: any;
};

export const ImageBlockRenderer: React.FC<ImageBlockRendererProps> = ({
  block,
}) => {
  // 型の安全性を確保
  if (!isImageBlock(block)) {
    console.warn("Block is not an image block", block);
    return null;
  }

  // 画像データを安全に取得
  const imageData = block.image;
  let imageUrl = "";

  // 画像URLを安全に取得
  if (
    imageData.type === "file" &&
    imageData.file &&
    typeof imageData.file.url === "string"
  ) {
    imageUrl = imageData.file.url;
  } else if (
    imageData.type === "external" &&
    imageData.external &&
    typeof imageData.external.url === "string"
  ) {
    imageUrl = imageData.external.url;
  }

  if (!imageUrl) {
    console.warn("Could not extract image URL from block", block);
    return null;
  }

  // キャプションを安全に取得
  let caption = "";
  if (
    imageData.caption &&
    Array.isArray(imageData.caption) &&
    imageData.caption.length > 0
  ) {
    caption = imageData.caption
      .map((item: NotionRichText) => item.plain_text)
      .join("");
  }

  // 親IDを取得
  const parentId = getParentId(block);

  // サイズ設定 - レスポンシブに対応
  const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1000px";

  return (
    <div className="nbr-block-image">
      <div className="nbr-image">
        <NotionImage
          src={imageUrl}
          alt={caption || ""}
          width={800}
          height={400}
          sizes={sizes}
          className="mx-auto max-w-full h-auto rounded-lg"
          style={{ objectFit: "contain" }}
          blockId={block.id}
          pageId={parentId}
          retryLimit={5}
          priority={false} // 通常は遅延読み込み
        />
      </div>
      {caption && (
        <div className="nbr-caption text-center text-sm text-gray-500 mt-3">
          {caption}
        </div>
      )}
    </div>
  );
};
