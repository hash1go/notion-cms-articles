import { BlockType as NotionBlockType } from "notion-block-renderer";

export type FileType = {
  file?: { url: string };
  external?: { url: string };
};

export type AnnotationType = {
  bold: boolean;
  code: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  color: string;
};

export type RichTextType = {
  plain_text: string;
  href: string | null;
  annotations: AnnotationType;
};

export type PropertyType = {
  name: { title: RichTextType[] };
  url: { rich_text: RichTextType[] };
  author: { rich_text: RichTextType[] };
  slug: { rich_text: RichTextType[] };
  date: { date: { start: string } };
  isPublic: { checkbox: boolean };
  tags: { multi_select: [{ name: string }] };
  description: { rich_text: RichTextType[] };
};

export type NotionAPIPageResponse = {
  id: string;
  object: "page";
  cover?: {
    type?: "external" | "file";
    external?: { url: string };
    file?: { url: string; expiry_time?: string };
  };
  properties: Record<string, any>;
};

export type NotionAPIBlockResponse = {
  id: string;
  object: "block";
  type?: string;
  image?: {
    type?: "external" | "file";
    external?: { url: string };
    file?: { url: string; expiry_time?: string };
  };
};

export type NotionImageBlock = {
  id: string;
  type: "image";
  image: {
    type: "file" | "external";
    file?: { url: string; expiry_time?: string };
    external?: { url: string };
    caption?: Array<{ plain_text: string }>;
  };
  parent_id?: string;
  parent?: { page_id: string };
};

// 自前のBlockType定義を別名に変更
export type CustomBlockType = {
  id: string;
  type: string;
  parent_id?: string;
  parent?: { page_id: string };
  // 画像ブロック用
  image?: {
    type?: "file" | "external";
    file?: { url: string };
    external?: { url: string };
    caption?: Array<{ plain_text: string }>;
  };
};

// NotionブロックとImageブロックのインターフェースの定義を変更
export type ImageBlock = NotionBlockType & {
  type: "image";
  image: {
    type: string;
    file?: { url: string; expiry_time?: string };
    external?: { url: string };
    caption?: Array<{ plain_text: string }>;
  };
  parent_id?: string;
  parent?: { page_id: string };
};
