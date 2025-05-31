import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import {
  NotionAPIError,
  ValidationError,
  formatErrorForLogging,
} from "@/lib/errors";

// エラーレスポンスを生成するヘルパー関数
function errorResponse(error: unknown, status: number = 500) {
  const formatted = formatErrorForLogging(error);

  return NextResponse.json(
    {
      error: formatted.message,
      code: formatted.code,
      ...(process.env.NODE_ENV === "development" && {
        details: formatted.details,
      }),
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

// Notion クライアントの初期化（エラーハンドリング付き）
function getNotionClient() {
  const apiKey = process.env.NOTION_KEY;

  if (!apiKey) {
    throw new ValidationError("NOTION_KEY environment variable is not set");
  }

  return new Client({ auth: apiKey });
}

// キャッシュ付きのNotion API呼び出し
const fetchNotionImage = unstable_cache(
  async (pageId: string, blockId?: string) => {
    const notion = getNotionClient();

    try {
      let url = "";

      // 画像のタイプに応じて処理を分岐
      if (!blockId) {
        console.log(`Fetching cover image for page: ${pageId}`);

        try {
          const page = (await notion.pages.retrieve({
            page_id: pageId,
          })) as any;

          if (page.cover) {
            if (page.cover.type === "file" && page.cover.file) {
              url = page.cover.file.url;
            } else if (page.cover.type === "external" && page.cover.external) {
              url = page.cover.external.url;
            }
          }
        } catch (error: any) {
          if (error?.code === "object_not_found") {
            throw new NotionAPIError(`Page not found: ${pageId}`, error);
          }
          throw error;
        }
      } else if (typeof blockId === "string") {
        console.log(`Fetching block image: ${blockId} from page: ${pageId}`);

        try {
          const block = (await notion.blocks.retrieve({
            block_id: blockId,
          })) as any;

          if (block.type === "image" && block.image) {
            if (block.image.type === "file" && block.image.file) {
              url = block.image.file.url;
            } else if (
              block.image.type === "external" &&
              block.image.external
            ) {
              url = block.image.external.url;
            }
          }
        } catch (error: any) {
          if (error?.code === "object_not_found") {
            throw new NotionAPIError(`Block not found: ${blockId}`, error);
          }
          throw error;
        }
      }

      return {
        url,
        error: url ? null : "Image not found in the specified location",
      };
    } catch (error) {
      // Notion APIエラーの詳細なハンドリング
      if (error instanceof NotionAPIError) {
        throw error;
      }

      const formattedError = formatErrorForLogging(error);
      console.error("Error in fetchNotionImage:", formattedError);

      // 一般的なエラーをNotionAPIErrorでラップ
      throw new NotionAPIError("Failed to fetch image from Notion", error);
    }
  },
  ["notion-image"],
  { revalidate: 60 } // 60秒ごとに再検証
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageId = searchParams.get("pageId");
    const blockId = searchParams.get("blockId");

    // バリデーション
    if (!pageId) {
      throw new ValidationError("Page ID is required", "pageId");
    }

    // UUID形式の簡易チェック
    const uuidPattern =
      /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    const pageIdNormalized = pageId.replace(/-/g, "");

    if (!uuidPattern.test(pageId) && !uuidPattern.test(pageIdNormalized)) {
      throw new ValidationError("Invalid Page ID format", "pageId");
    }

    if (blockId) {
      const blockIdNormalized = blockId.replace(/-/g, "");
      if (!uuidPattern.test(blockId) && !uuidPattern.test(blockIdNormalized)) {
        throw new ValidationError("Invalid Block ID format", "blockId");
      }
    }

    // メイン処理
    const result = await fetchNotionImage(pageId, blockId || undefined);

    if (result.error) {
      // 画像が見つからない場合は404
      return NextResponse.json(
        { error: result.error },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // 成功レスポンス
    return NextResponse.json(
      { url: result.url },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=60, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Error in refreshImageUrl API:", error);

    // エラータイプに応じたステータスコードの決定
    if (error instanceof ValidationError) {
      return errorResponse(error, 400);
    }

    if (error instanceof NotionAPIError) {
      // Notion APIの特定のエラーコードに基づくステータス
      const details = error.details;
      if (details?.code === "unauthorized") {
        return errorResponse(error, 401);
      }
      if (details?.code === "object_not_found") {
        return errorResponse(error, 404);
      }
      if (details?.code === "rate_limited") {
        return errorResponse(error, 429);
      }
    }

    // その他のエラーは500
    return errorResponse(error, 500);
  }
}
