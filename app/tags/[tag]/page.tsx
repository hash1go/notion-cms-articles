import Card from "@/components/Card";
import { fetchPages } from "@/utils/notion";
import { PageType } from "@/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMultiSelect } from "@/utils/property";

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `#${resolvedParams.tag}`,
    description: `Posts tagged with #${resolvedParams.tag}`,
  };
}

export async function generateStaticParams() {
  const { results } = await fetchPages({});
  const pages = results as PageType[];

  // 各ページのタグを抽出してセットに追加
  const tagSet: Set<string> = new Set();
  pages.forEach((page) => {
    getMultiSelect(page.properties.tags.multi_select).forEach((tag) =>
      tagSet.add(tag)
    );
  });

  return Array.from(tagSet).map((tag) => ({
    tag,
  }));
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const resolvedParams = await params;
  const { tag } = resolvedParams;
  const { results } = await fetchPages({ tag });

  if (!results || results.length === 0) {
    notFound();
  }

  return (
    <div className="pt-12">
      <h1 className="text-3xl mb-6 text-gray-700">{`#${tag}`}</h1>
      <div className="grid gap-6 mt-8 w-full my-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((page: PageType, index: number) => (
          <Card key={index} page={page} />
        ))}
      </div>
    </div>
  );
}
