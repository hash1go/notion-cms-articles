import { ParsedUrlQuery } from "querystring";
import { FileType, PropertyType } from "./notion";

export type PageProps = {
  slug: string;
  name: string;
  author: string;
  cover: string;
  date: string;
  tags: string[];
  content: string;
};

export type PageType = {
  id: string;
  cover: FileType | null;
  properties: PropertyType;
};

export type CardProps = { page: PageType };

export type ArticleProps = {
  page: PageType;
  blocks: any[];
  relatedPosts?: PageType[];
};

export type ArticleMetaProps = CardProps;

export type IndexProps = { pages: PageType[] };

export type TagProps = IndexProps & { tag: string };

export type BlockProps = { block: any };

export type Params = ParsedUrlQuery & {
  slug?: string;
  tag?: string;
};

export type AuthorProps = {
  authorName: string;
  authorInfo?: AuthorInfo;
};

export type AuthorInfo = {
  id: string;
  twitterUrl: string;
  icon: string;
};
