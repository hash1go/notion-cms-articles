import { BlockType as NotionBlockType } from "notion-block-renderer";
import {
  NotionRichText,
  NotionFile,
  PageProperties as NotionPageProperties,
} from "./notion-api";

// FileTypeをNotionFileと同じ構造に更新
export type FileType = NotionFile;

export type AnnotationType = {
  bold: boolean;
  code: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  color: string;
};

export type RichTextType = NotionRichText;

export type PropertyType = NotionPageProperties;

export type NotionAPIPageResponse = {
  id: string;
  object: "page";
  cover?: NotionFile | null;
  properties: NotionPageProperties;
};

export type NotionAPIBlockResponse = {
  id: string;
  object: "block";
  type?: string;
  image?: NotionFile;
};

export type NotionImageBlock = {
  id: string;
  type: "image";
  image: NotionFile;
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
  image?: NotionFile;
};

// NotionブロックとImageブロックのインターフェースの定義を変更
// notion-block-rendererとの互換性のための型
export type CustomImageBlock = NotionBlockType & {
  type: "image";
  image: NotionFile;
  parent_id?: string;
  parent?: { page_id: string };
};
