import {
  isParagraphBlock,
  isImageBlock as isNotionImageBlock,
  isDividerBlock as isNotionDividerBlock,
  isEquationBlock as isNotionEquationBlock,
  isBulletedListItemBlock,
  isNumberedListItemBlock,
  isCodeBlock as isNotionCodeBlock,
  NotionRichText,
} from "@/types/notion-api";

// 注意: blockTypeGuards内の関数では、notion-block-rendererとの型の互換性のため、
// blockパラメータにany型を使用しています。型ガード関数として機能するため、
// 内部で適切な型チェックを行い、戻り値で型の安全性を保証しています。
export const blockTypeGuards = {
  isImageBlock: (block: any): boolean => {
    return isNotionImageBlock(block);
  },
  // ページ区切り（Divider）ブロックの検出
  isDividerBlock: (block: any): boolean => {
    return isNotionDividerBlock(block);
  },
  // 数式ブロックの検出
  isEquationBlock: (block: any): boolean => {
    return isNotionEquationBlock(block);
  },
  // リンクを含むブロックを検出する共通関数
  hasLink: (richText: NotionRichText[]): boolean => {
    return (
      Array.isArray(richText) &&
      richText.some(
        (textBlock: NotionRichText) =>
          textBlock.href !== null && textBlock.href !== undefined
      )
    );
  },
  // リンクを含む段落を検出
  hasLinkInParagraph: (block: any): boolean => {
    return (
      isParagraphBlock(block) &&
      block.paragraph.rich_text &&
      blockTypeGuards.hasLink(block.paragraph.rich_text)
    );
  },
  // リンクを含む箇条書きリストを検出
  hasLinkInBulletedList: (block: any): boolean => {
    return (
      isBulletedListItemBlock(block) &&
      block.bulleted_list_item.rich_text &&
      blockTypeGuards.hasLink(block.bulleted_list_item.rich_text)
    );
  },
  // リンクを含む番号付きリストを検出
  hasLinkInNumberedList: (block: any): boolean => {
    return (
      isNumberedListItemBlock(block) &&
      block.numbered_list_item.rich_text &&
      blockTypeGuards.hasLink(block.numbered_list_item.rich_text)
    );
  },
  // 数式を含む段落を検出
  isParagraphWithMath: (block: any): boolean => {
    if (!isParagraphBlock(block)) return false;

    return block.paragraph.rich_text.some(
      (textBlock: NotionRichText) =>
        textBlock.type === "equation" && textBlock.equation !== undefined
    );
  },
  // 将来的に追加する型ガード
  isMathBlock: (block: any): boolean => {
    return isNotionEquationBlock(block);
  },
  isCodeBlock: (block: any): boolean => {
    return isNotionCodeBlock(block);
  },
};

// 注意: notion-block-rendererから受け取るブロックの型が不定なため、any型を使用
export const getParentId = (block: any): string | undefined => {
  if (!block) return undefined;

  // BlockWithParentIdの場合
  if ("parent_id" in block && typeof block.parent_id === "string") {
    return block.parent_id;
  }

  // 通常のNotionBlockの場合
  if ("parent" in block && block.parent && typeof block.parent === "object") {
    if ("page_id" in block.parent && typeof block.parent.page_id === "string") {
      return block.parent.page_id;
    }
  }

  return undefined;
};
