import { fetchBlocksByPageId, fetchPages } from "@/utils/notion";
import ArticleMeta from "@/components/ArticleMeta";
import ArticleFooter from "@/components/ArticleFooter";
import CustomNotionRenderer from "@/components/CustomNotionRenderer";
import { PageType } from "@/types";
import { getText, getCover, getDate } from "@/utils/property";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { results } = await fetchPages({ slug: resolvedParams.slug });

  if (!results || results.length === 0) {
    return {
      title: "Article Not Found",
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
}

export async function generateStaticParams() {
  const { results } = await fetchPages({});
  const pages = results as PageType[];

  return pages.map((page) => ({
    slug: getText(page.properties.slug.rich_text),
  }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    const { results } = await fetchPages({ slug });
    if (!results || results.length === 0) {
      notFound();
    }

    const page = results[0] as PageType;
    const { results: blocks } = await fetchBlocksByPageId(page.id);

    // 関連記事を取得（現時点では空配列を返す）
    const relatedPosts: PageType[] = [];

    // 将来的な実装: タグベースの関連記事
    // if (page.properties.tags && page.properties.tags.multi_select) {
    //   const tags = page.properties.tags.multi_select.map(tag => tag.name);
    //   if (tags.length > 0) {
    //     const { results: tagResults } = await fetchPages({ tag: tags[0] });
    //     // 自身の記事を除外し、最大3件まで
    //     relatedPosts.push(...tagResults.filter(p => p.id !== page.id).slice(0, 3));
    //   }
    // }

    return (
      <article className="w-full">
        <div className="my-12">
          <ArticleMeta page={page} />
        </div>
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

        <ArticleFooter relatedPosts={relatedPosts} />
      </article>
    );
  } catch (error) {
    console.error("Error fetching page:", error);
    notFound();
  }
}
