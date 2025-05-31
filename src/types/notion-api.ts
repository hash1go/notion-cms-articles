// Notion APIの基本的な型を手動で定義（@notionhq/clientの内部型が直接エクスポートされていないため）
export interface NotionBlock {
  object: "block";
  id: string;
  parent: {
    type: "page_id" | "database_id" | "block_id" | "workspace";
    page_id?: string;
    database_id?: string;
    block_id?: string;
    workspace?: boolean;
  };
  created_time: string;
  last_edited_time: string;
  created_by: { object: "user"; id: string };
  last_edited_by: { object: "user"; id: string };
  has_children: boolean;
  archived: boolean;
  type: string;
  [key: string]: any;
}

// RichTextオブジェクトの型
export interface NotionRichText {
  type: "text" | "mention" | "equation";
  text?: {
    content: string;
    link?: { url: string } | null;
  };
  mention?: {
    type: "user" | "page" | "database" | "date";
    user?: { id: string };
    page?: { id: string };
    database?: { id: string };
    date?: { start: string; end?: string | null };
  };
  equation?: {
    expression: string;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color:
      | "default"
      | "gray"
      | "brown"
      | "orange"
      | "yellow"
      | "green"
      | "blue"
      | "purple"
      | "pink"
      | "red"
      | "gray_background"
      | "brown_background"
      | "orange_background"
      | "yellow_background"
      | "green_background"
      | "blue_background"
      | "purple_background"
      | "pink_background"
      | "red_background";
  };
  plain_text: string;
  href?: string | null;
}

// ファイルオブジェクトの型
export interface NotionFile {
  type: "file" | "external";
  file?: {
    url: string;
    expiry_time?: string;
  };
  external?: {
    url: string;
  };
  caption?: NotionRichText[];
}

// 各ブロックタイプの詳細な型定義
export interface ParagraphBlock extends NotionBlock {
  type: "paragraph";
  paragraph: {
    rich_text: NotionRichText[];
    color: string;
  };
}

export interface Heading1Block extends NotionBlock {
  type: "heading_1";
  heading_1: {
    rich_text: NotionRichText[];
    color: string;
    is_toggleable: boolean;
  };
}

export interface Heading2Block extends NotionBlock {
  type: "heading_2";
  heading_2: {
    rich_text: NotionRichText[];
    color: string;
    is_toggleable: boolean;
  };
}

export interface Heading3Block extends NotionBlock {
  type: "heading_3";
  heading_3: {
    rich_text: NotionRichText[];
    color: string;
    is_toggleable: boolean;
  };
}

export interface BulletedListItemBlock extends NotionBlock {
  type: "bulleted_list_item";
  bulleted_list_item: {
    rich_text: NotionRichText[];
    color: string;
  };
}

export interface NumberedListItemBlock extends NotionBlock {
  type: "numbered_list_item";
  numbered_list_item: {
    rich_text: NotionRichText[];
    color: string;
  };
}

export interface QuoteBlock extends NotionBlock {
  type: "quote";
  quote: {
    rich_text: NotionRichText[];
    color: string;
  };
}

export interface CalloutBlock extends NotionBlock {
  type: "callout";
  callout: {
    rich_text: NotionRichText[];
    icon:
      | {
          type: "emoji";
          emoji: string;
        }
      | {
          type: "external";
          external: { url: string };
        }
      | {
          type: "file";
          file: { url: string; expiry_time?: string };
        };
    color: string;
  };
}

export interface CodeBlock extends NotionBlock {
  type: "code";
  code: {
    rich_text: NotionRichText[];
    caption: NotionRichText[];
    language: string;
  };
}

export interface ImageBlock extends NotionBlock {
  type: "image";
  image: NotionFile;
}

export interface VideoBlock extends NotionBlock {
  type: "video";
  video: NotionFile;
}

export interface DividerBlock extends NotionBlock {
  type: "divider";
  divider: Record<string, never>;
}

export interface EquationBlock extends NotionBlock {
  type: "equation";
  equation: {
    expression: string;
  };
}

export interface TableOfContentsBlock extends NotionBlock {
  type: "table_of_contents";
  table_of_contents: {
    color: string;
  };
}

// サポートされているブロックタイプ
export type SupportedBlockType =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | QuoteBlock
  | CalloutBlock
  | CodeBlock
  | ImageBlock
  | VideoBlock
  | DividerBlock
  | EquationBlock
  | TableOfContentsBlock;

// ページプロパティの型
export interface PageProperties {
  name: {
    type: "title";
    title: NotionRichText[];
    id: string;
  };
  slug: {
    type: "rich_text";
    rich_text: NotionRichText[];
    id: string;
  };
  date: {
    type: "date";
    date: {
      start: string;
      end?: string | null;
      time_zone?: string | null;
    } | null;
    id: string;
  };
  tags: {
    type: "multi_select";
    multi_select: Array<{
      id: string;
      name: string;
      color: string;
    }>;
    id: string;
  };
  description: {
    type: "rich_text";
    rich_text: NotionRichText[];
    id: string;
  };
  author: {
    type: "rich_text";
    rich_text: NotionRichText[];
    id: string;
  };
  url: {
    type: "rich_text";
    rich_text: NotionRichText[];
    id: string;
  };
  isPublic: {
    type: "checkbox";
    checkbox: boolean;
    id: string;
  };
}

// カスタムブロック型（親IDを含む）
export interface BlockWithParentId extends NotionBlock {
  parent_id?: string;
}

// ページ型
export interface NotionPage {
  object: "page";
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: { object: "user"; id: string };
  last_edited_by: { object: "user"; id: string };
  cover: NotionFile | null;
  icon:
    | null
    | {
        type: "emoji";
        emoji: string;
      }
    | {
        type: "external";
        external: { url: string };
      }
    | {
        type: "file";
        file: { url: string; expiry_time?: string };
      };
  parent: {
    type: "database_id" | "page_id" | "workspace";
    database_id?: string;
    page_id?: string;
    workspace?: boolean;
  };
  archived: boolean;
  properties: PageProperties;
  url: string;
}

// 型ガード関数
export function isFullBlock(block: any): block is NotionBlock {
  return block && typeof block === "object" && "type" in block && "id" in block;
}

export function isParagraphBlock(block: any): block is ParagraphBlock {
  return isFullBlock(block) && block.type === "paragraph";
}

export function isHeading1Block(block: any): block is Heading1Block {
  return isFullBlock(block) && block.type === "heading_1";
}

export function isHeading2Block(block: any): block is Heading2Block {
  return isFullBlock(block) && block.type === "heading_2";
}

export function isHeading3Block(block: any): block is Heading3Block {
  return isFullBlock(block) && block.type === "heading_3";
}

export function isImageBlock(block: any): block is ImageBlock {
  return isFullBlock(block) && block.type === "image";
}

export function isVideoBlock(block: any): block is VideoBlock {
  return isFullBlock(block) && block.type === "video";
}

export function isCodeBlock(block: any): block is CodeBlock {
  return isFullBlock(block) && block.type === "code";
}

export function isEquationBlock(block: any): block is EquationBlock {
  return isFullBlock(block) && block.type === "equation";
}

export function isDividerBlock(block: any): block is DividerBlock {
  return isFullBlock(block) && block.type === "divider";
}

export function isCalloutBlock(block: any): block is CalloutBlock {
  return isFullBlock(block) && block.type === "callout";
}

export function isQuoteBlock(block: any): block is QuoteBlock {
  return isFullBlock(block) && block.type === "quote";
}

export function isBulletedListItemBlock(
  block: any
): block is BulletedListItemBlock {
  return isFullBlock(block) && block.type === "bulleted_list_item";
}

export function isNumberedListItemBlock(
  block: any
): block is NumberedListItemBlock {
  return isFullBlock(block) && block.type === "numbered_list_item";
}

export function isTableOfContentsBlock(
  block: any
): block is TableOfContentsBlock {
  return isFullBlock(block) && block.type === "table_of_contents";
}
