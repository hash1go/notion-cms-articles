import { fetchBlocksByPageId, fetchPages } from "@/lib/notion/client";
import ArticleMeta from "@/components/layout/ArticleMeta";
import ArticleFooter from "@/components/layout/ArticleFooter";
import CustomNotionRenderer from "@/components/notion/CustomNotionRenderer";
import { PageType } from "@/types";
import { getText, getCover, getDate } from "@/lib/utils/property";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotFoundError, NotionAPIError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { results } = await fetchPages({ slug: resolvedParams.slug });

    if (!results || results.length === 0) {
      return {
        title: "Article Not Found",
        description: "The requested article could not be found.",
      };
    }

    const page = results[0] as PageType;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
    const canonicalUrl = `${siteUrl}/articles/${getText(
      page.properties.slug.rich_text
    )}`;

    return {
      title: getText(page.properties.name.title),
      description: getText(page.properties.description.rich_text),
      openGraph: {
        title: getText(page.properties.name.title),
        description: getText(page.properties.description.rich_text),
        type: "article",
        publishedTime: getDate(page.properties.date.date),
        authors: [getText(page.properties.author.rich_text)],
        images: [getCover(page.cover)],
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "An error occurred while loading this page.",
    };
  }
}

export async function generateStaticParams() {
  try {
    const { results } = await fetchPages({});
    const pages = results as PageType[];

    return pages.map((page) => ({
      slug: getText(page.properties.slug.rich_text),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    // エラーが発生した場合は空配列を返す（ビルドを続行）
    return [];
  }
}

// エラー表示コンポーネント
function ArticleError({ error }: { error: Error }) {
  const isNotFound = error instanceof NotFoundError;

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {isNotFound ? "記事が見つかりません" : "エラーが発生しました"}
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {isNotFound
            ? "お探しの記事は削除されたか、URLが間違っている可能性があります。"
            : "記事の読み込み中にエラーが発生しました。しばらくしてからもう一度お試しください。"}
        </p>
        <a
          href="/"
          className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300"
        >
          ホームに戻る
        </a>
      </div>
    </div>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    // ページ情報の取得
    const { results } = await fetchPages({ slug });
    if (!results || results.length === 0) {
      notFound();
    }

    const page = results[0] as PageType;

    // ブロック情報の取得（別途エラーハンドリング）
    let blocks = [];
    let blocksError = null;

    try {
      const { results: fetchedBlocks } = await fetchBlocksByPageId(page.id);
      blocks = fetchedBlocks;
    } catch (error) {
      console.error("Error fetching blocks:", error);
      blocksError = error;
    }

    // 関連記事を取得（エラーが発生しても続行）
    const relatedPosts: PageType[] = [];

    // 将来的な実装: タグベースの関連記事
    // try {
    //   if (page.properties.tags && page.properties.tags.multi_select) {
    //     const tags = page.properties.tags.multi_select.map(tag => tag.name);
    //     if (tags.length > 0) {
    //       const { results: tagResults } = await fetchPages({ tag: tags[0] });
    //       // 自身の記事を除外し、最大3件まで
    //       relatedPosts.push(...tagResults.filter(p => p.id !== page.id).slice(0, 3));
    //     }
    //   }
    // } catch (error) {
    //   console.error("Error fetching related posts:", error);
    //   // 関連記事の取得に失敗しても続行
    // }

    return (
      <article className="w-full">
        <div className="my-12">
          <ArticleMeta page={page} />
        </div>

        {blocksError ? (
          // ブロックの取得に失敗した場合のフォールバック
          <div className="my-12 p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              記事の内容を読み込めませんでした。しばらくしてからもう一度お試しください。
            </p>
          </div>
        ) : (
          <div className="my-12 break-words">
            <CustomNotionRenderer
              blocks={blocks}
              isCodeHighlighter={true}
              customRenderers={{
                image: true,
                divider: true,
                equation: true,
                paragraph: true,
                link: true,
              }}
            />
          </div>
        )}

        <ArticleFooter relatedPosts={relatedPosts} />
      </article>
    );
  } catch (error) {
    // NotFoundErrorの場合は404ページへ
    if (error instanceof NotFoundError) {
      notFound();
    }

    // その他のエラーはエラー表示
    console.error("Error in article page:", error);
    return <ArticleError error={error as Error} />;
  }
}
