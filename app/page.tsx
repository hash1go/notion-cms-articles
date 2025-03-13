import { fetchPages } from "@/utils/notion";
import Card from "@/components/Card";
import { PageType } from "@/types";
import { Metadata } from "next";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    images: siteConfig.defaultImage ? [siteConfig.defaultImage] : [],
  },
};

// 再生成間隔の設定（ISRと同等）
export const revalidate = 60;

export default async function HomePage() {
  const { results } = await fetchPages({});
  const pages = results || [];

  return (
    <div className="pt-12">
      <div className="grid gap-6 mt-8 w-full my-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pages.map((page: PageType, index: number) => (
          <Card
            key={index}
            page={page}
            priority={index < 4} // 最初の4枚の画像には priority を設定
          />
        ))}
      </div>
    </div>
  );
}
