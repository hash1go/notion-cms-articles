import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";

// キャッシュ付きのNotion API呼び出し
const fetchNotionImage = unstable_cache(
  async (pageId: string, blockId?: string) => {
    try {
      const notion = new Client({ auth: process.env.NOTION_KEY as string });
      let url = "";

      // 画像のタイプに応じて処理を分岐
      if (!blockId) {
        console.log(`Fetching cover image for page: ${pageId}`);
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
      } else if (typeof blockId === "string") {
        console.log(`Fetching block image: ${blockId} from page: ${pageId}`);
        const block = (await notion.blocks.retrieve({
          block_id: blockId,
        })) as any;

        if (block.type === "image" && block.image) {
          if (block.image.type === "file" && block.image.file) {
            url = block.image.file.url;
          } else if (block.image.type === "external" && block.image.external) {
            url = block.image.external.url;
          }
        }
      }

      return { url, error: url ? null : "Image not found" };
    } catch (error) {
      console.error("Error in fetchNotionImage:", error);
      return { url: "", error: "Failed to fetch image URL" };
    }
  },
  ["notion-image"],
  { revalidate: 60 } // 60秒ごとに再検証
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pageId = searchParams.get("pageId");
  const blockId = searchParams.get("blockId");

  if (!pageId) {
    return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
  }

  try {
    const result = await fetchNotionImage(pageId, blockId || undefined);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.url ? 200 : 404 }
      );
    }

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
    console.error("Error refreshing image URL:", error);
    return NextResponse.json(
      { error: "Failed to refresh image URL" },
      { status: 500 }
    );
  }
}
