import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import {
  BlockWithParentId,
  PageProperties,
  NotionPage,
} from "@/types/notion-api";
import {
  NotionAPIError,
  ValidationError,
  NotFoundError,
  formatErrorForLogging,
} from "@/lib/errors";

// サーバーコンポーネント内で再利用するためのクライアント生成
const notion = new Client({ auth: process.env.NOTION_KEY as string });

// エラーハンドリング付きのAPI呼び出しラッパー
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Notion APIの特定のエラーをハンドリング
    if (error?.code === "object_not_found") {
      throw new NotFoundError("Content", error?.message);
    }

    if (error?.code === "unauthorized") {
      throw new NotionAPIError(
        "Notion API認証エラー: APIキーを確認してください",
        error
      );
    }

    if (error?.code === "rate_limited") {
      throw new NotionAPIError(
        "APIレート制限に達しました。しばらくお待ちください。",
        error
      );
    }

    // その他のエラー
    const formattedError = formatErrorForLogging(error);
    console.error(errorMessage, formattedError);

    throw new NotionAPIError(errorMessage, error);
  }
}

// ブロック取得関数も同様に最適化
export const fetchBlocksByPageId = unstable_cache(
  async (pageId: string) => {
    return withErrorHandling(async () => {
      const data: any[] = [];
      let cursor: string | undefined = undefined;
      let retryCount = 0;
      const maxRetries = 3;

      while (true) {
        try {
          const response = await notion.blocks.children.list({
            block_id: pageId,
            start_cursor: cursor,
          });

          if (
            !response ||
            typeof response !== "object" ||
            !Array.isArray(response.results)
          ) {
            throw new NotionAPIError("Unexpected blocks response structure.");
          }

          // 各ブロックにpage_idを追加
          const blocksWithParentId = response.results.map((block) => ({
            ...block,
            parent_id: pageId, // 親ページIDを追加
          }));

          data.push(...blocksWithParentId);

          if (!response.next_cursor) break;
          cursor = response.next_cursor;

          // リトライカウントをリセット
          retryCount = 0;
        } catch (error: any) {
          // レート制限エラーの場合はリトライ
          if (error?.code === "rate_limited" && retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000; // 指数バックオフ
            console.warn(`Rate limited, retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          throw error;
        }
      }

      return { results: data };
    }, `Failed to fetch blocks for page ${pageId}`);
  },
  ["notion-blocks"],
  { revalidate: 60 }
);

const DATABASE_ID = process.env.NOTION_DATABASE_ID as string;

// 環境変数のバリデーション
if (!process.env.NOTION_KEY) {
  throw new ValidationError("NOTION_KEY environment variable is not set");
}

if (!DATABASE_ID) {
  throw new ValidationError(
    "NOTION_DATABASE_ID environment variable is not set"
  );
}

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
const validateProperties = (props: any): Partial<PageProperties> => {
  const missingProperties: string[] = [];

  REQUIRED_PROPERTIES.forEach((key) => {
    if (!props[key]) {
      missingProperties.push(key);
    }
  });

  if (missingProperties.length > 0) {
    console.warn(
      `Required properties missing in Notion page: ${missingProperties.join(
        ", "
      )}. ` + `Please check your Notion database schema.`
    );
  }

  return props;
};

// ページオブジェクトから必要なプロパティのみを抜き出して返す関数
const sanitizePage = (page: any) => {
  try {
    const props = validateProperties(page.properties || {});
    return {
      id: page.id,
      cover: page.cover || null,
      properties: {
        name: props.name || { type: "title" as const, title: [], id: "" },
        slug: props.slug || {
          type: "rich_text" as const,
          rich_text: [],
          id: "",
        },
        date: props.date || { type: "date" as const, date: null, id: "" },
        tags: props.tags || {
          type: "multi_select" as const,
          multi_select: [],
          id: "",
        },
        description: props.description || {
          type: "rich_text" as const,
          rich_text: [],
          id: "",
        },
        author: props.author || {
          type: "rich_text" as const,
          rich_text: [],
          id: "",
        },
        url: props.url || { type: "rich_text" as const, rich_text: [], id: "" },
        isPublic: props.isPublic || {
          type: "checkbox" as const,
          checkbox: false,
          id: "",
        },
      } as PageProperties,
    };
  } catch (error) {
    console.error("Error sanitizing page:", error);
    throw new NotionAPIError("Failed to process page data", error);
  }
};

// App Routerのキャッシュを利用したページ取得関数
export const fetchPages = unstable_cache(
  async ({ slug, tag }: { slug?: string; tag?: string } = {}) => {
    // 入力値のバリデーション
    const allowedPattern =
      /^[\p{L}\p{N}\p{P}\p{Zs}\p{M}\p{Extended_Pictographic}]+$/u;

    if (slug && !allowedPattern.test(slug)) {
      throw new ValidationError("Invalid slug format.", "slug");
    }
    if (tag && !allowedPattern.test(tag)) {
      throw new ValidationError("Invalid tag format.", "tag");
    }

    return withErrorHandling(async () => {
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

      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: { and: filters },
        sorts: [{ property: "date", direction: "descending" }],
      });

      if (!isValidNotionResponse(response)) {
        throw new NotionAPIError(
          "Unexpected response structure from Notion API"
        );
      }

      // 必要なプロパティが存在するページのみ抽出
      const safeResults = response.results.filter((page: any) => {
        try {
          return (
            page &&
            page.properties &&
            page.properties.slug &&
            page.properties.slug.rich_text &&
            Array.isArray(page.properties.slug.rich_text)
          );
        } catch {
          return false;
        }
      });

      // 結果が0件の場合の処理
      if (slug && safeResults.length === 0) {
        throw new NotFoundError("Article", slug);
      }

      // サニタイズして必要な情報だけを返す
      const sanitizedResults = safeResults.map(sanitizePage);

      return { results: sanitizedResults };
    }, "Failed to fetch pages from Notion");
  },
  ["notion-pages"],
  {
    revalidate: 60,
  }
);
