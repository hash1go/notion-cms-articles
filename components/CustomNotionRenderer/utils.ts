export const blockTypeGuards = {
  isImageBlock: (block: any): boolean => {
    return (
      block &&
      typeof block === "object" &&
      block.type === "image" &&
      block.image
    );
  },
  // ページ区切り（Divider）ブロックの検出
  isDividerBlock: (block: any): boolean => {
    return block && typeof block === "object" && block.type === "divider";
  },
  // 数式ブロックの検出
  isEquationBlock: (block: any): boolean => {
    return (
      block &&
      typeof block === "object" &&
      block.type === "equation" &&
      block.equation
    );
  },
  // リンクを含むブロックを検出する共通関数
  hasLink: (richText: any[]): boolean => {
    return (
      Array.isArray(richText) &&
      richText.some((textBlock: any) => textBlock.href)
    );
  },
  // リンクを含む段落を検出
  hasLinkInParagraph: (block: any): boolean => {
    return (
      block &&
      typeof block === "object" &&
      block.type === "paragraph" &&
      block.paragraph &&
      block.paragraph.rich_text &&
      blockTypeGuards.hasLink(block.paragraph.rich_text)
    );
  },
  // リンクを含む箇条書きリストを検出
  hasLinkInBulletedList: (block: any): boolean => {
    return (
      block &&
      typeof block === "object" &&
      block.type === "bulleted_list_item" &&
      block.bulleted_list_item &&
      block.bulleted_list_item.rich_text &&
      blockTypeGuards.hasLink(block.bulleted_list_item.rich_text)
    );
  },
  // リンクを含む番号付きリストを検出
  hasLinkInNumberedList: (block: any): boolean => {
    return (
      block &&
      typeof block === "object" &&
      block.type === "numbered_list_item" &&
      block.numbered_list_item &&
      block.numbered_list_item.rich_text &&
      blockTypeGuards.hasLink(block.numbered_list_item.rich_text)
    );
  },
  // 将来的に追加する型ガード
  isMathBlock: (block: any): boolean => {
    return (
      block &&
      typeof block === "object" &&
      block.type === "equation" &&
      block.equation
    );
  },
  isCodeBlock: (block: any): boolean => {
    return (
      block && typeof block === "object" && block.type === "code" && block.code
    );
  },
};

export const getParentId = (block: any): string | undefined => {
  if (!block) return undefined;

  if (typeof block.parent_id === "string") return block.parent_id;

  if (block.parent && typeof block.parent === "object") {
    if (typeof block.parent.page_id === "string") return block.parent.page_id;
    if (
      block.parent.type === "page_id" &&
      typeof block.parent.page_id === "string"
    ) {
      return block.parent.page_id;
    }
  }

  return undefined;
};
