import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";

// サーバーコンポーネント内で再利用するためのクライアント生成
const notion = new Client({ auth: process.env.NOTION_KEY as string });

// ブロック取得関数も同様に最適化
export const fetchBlocksByPageId = unstable_cache(
  async (pageId: string) => {
    const data: any[] = [];
    let cursor: string | undefined = undefined;

    try {
      while (true) {
        const response = await notion.blocks.children.list({
          block_id: pageId,
          start_cursor: cursor,
        });

        if (
          !response ||
          typeof response !== "object" ||
          !Array.isArray(response.results)
        ) {
          throw new Error("Unexpected blocks response structure.");
        }

        // 各ブロックにpage_idを追加
        const blocksWithParentId = response.results.map((block) => ({
          ...block,
          parent_id: pageId, // 親ページIDを追加
        }));

        data.push(...blocksWithParentId);

        if (!response.next_cursor) break;
        cursor = response.next_cursor;
      }
      return { results: data };
    } catch (err) {
      console.error("Error fetching blocks:", err);
      throw new Error("Failed to fetch blocks.");
    }
  },
  ["notion-blocks"],
  { revalidate: 60 }
);
const DATABASE_ID = process.env.NOTION_DATABASE_ID as string;

// レスポンスが想定どおりかを簡易チェックする関数
const isValidNotionResponse = (
  response: any
): response is { results: any[] } => {
  return (
    response && typeof response === "object" && Array.isArray(response.results)
  );
};

// Notion の各ページに必須とするプロパティ名
const REQUIRED_PROPERTIES = ["name", "slug", "date", "tags", "description"];

// Validate required properties and log errors if missing
const validateProperties = (props: any) => {
  REQUIRED_PROPERTIES.forEach((key) => {
    if (!props[key]) {
      console.error(
        `Required property '${key}' is missing in Notion page. Please check your Notion database settings.`
      );
    }
  });
  return props;
};

// ページオブジェクトから必要なプロパティのみを抜き出して返す関数
const sanitizePage = (page: any) => {
  const props = validateProperties(page.properties || {});
  return {
    id: page.id,
    cover: page.cover,
    properties: {
      name: props.name || { title: [] },
      slug: props.slug || { rich_text: [] },
      date: props.date || { date: { start: "" } },
      tags: props.tags || { multi_select: [] },
      description: props.description || { rich_text: [] },
      author: props.author || { rich_text: [] },
      url: props.url || { rich_text: [] },
      isPublic: props.isPublic || { checkbox: false },
    },
  };
};

// App Routerのキャッシュを利用したページ取得関数
export const fetchPages = unstable_cache(
  async ({ slug, tag }: { slug?: string; tag?: string }) => {
    // 許容する文字: Unicodeの文字(\p{L}), 数字(\p{N}), 句読点(\p{P}), 空白(\p{Zs}),
    // マーク(\p{M})および絵文字(\p{Extended_Pictographic})を許容
    const allowedPattern =
      /^[\p{L}\p{N}\p{P}\p{Zs}\p{M}\p{Extended_Pictographic}]+$/u;

    if (slug && !allowedPattern.test(slug)) {
      throw new Error("Invalid slug format.");
    }
    if (tag && !allowedPattern.test(tag)) {
      throw new Error("Invalid tag format.");
    }

    const filters: any[] = [
      {
        property: "isPublic",
        checkbox: { equals: true },
      },
      {
        property: "slug",
        rich_text: { is_not_empty: true },
      },
    ];

    if (slug) {
      filters.push({
        property: "slug",
        rich_text: { equals: slug },
      });
    }
    if (tag) {
      filters.push({
        property: "tags",
        multi_select: { contains: tag },
      });
    }

    try {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: { and: filters },
        sorts: [{ property: "date", direction: "descending" }],
      });

      if (!isValidNotionResponse(response)) {
        throw new Error("Unexpected response structure.");
      }

      // 必要なプロパティが存在するページのみ抽出
      const safeResults = response.results.filter((page: any) => {
        return (
          page &&
          page.properties &&
          page.properties.slug &&
          Array.isArray(page.properties.slug.rich_text)
        );
      });

      // サニタイズして必要な情報だけを返す
      const sanitizedResults = safeResults.map(sanitizePage);

      return { results: sanitizedResults };
    } catch (err) {
      console.error("Error fetching pages:", err);
      throw new Error("Failed to fetch pages.");
    }
  },
  ["notion-pages"],
  {
    revalidate: 60,
  }
);
