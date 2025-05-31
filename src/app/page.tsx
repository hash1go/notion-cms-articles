import { fetchPages } from "@/lib/notion/client";
import Card from "@/components/layout/Card";
import CardOptimized from "@/components/layout/CardOptimized";
import { PageType } from "@/types";
import { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { NotionAPIError } from "@/lib/errors";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    images: siteConfig.defaultImage ? [siteConfig.defaultImage] : [],
  },
};

export const dynamic = "force-dynamic";

// エラー表示コンポーネント
function HomeError({ error, retry }: { error: Error; retry?: () => void }) {
  const isAPIError = error instanceof NotionAPIError;

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isAPIError ? "コンテンツを読み込めません" : "エラーが発生しました"}
        </h2>

        <p className="text-gray-600 mb-8">
          {isAPIError
            ? "記事の一覧を取得できませんでした。しばらくしてからもう一度お試しください。"
            : "予期しないエラーが発生しました。ページを再読み込みしてください。"}
        </p>

        {retry && (
          <button
            onClick={retry}
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300"
          >
            再試行
          </button>
        )}

        {/* 開発環境でのエラー詳細 */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              エラーの詳細
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// 空の状態を表示するコンポーネント
function EmptyState() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          まだ記事がありません
        </h2>

        <p className="text-gray-600">
          最初の記事を作成して、ブログを始めましょう。
        </p>
      </div>
    </div>
  );
}

// ローディングスケルトン
function LoadingSkeleton() {
  return (
    <div className="grid gap-6 mt-8 w-full my-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="max-w-sm rounded overflow-hidden shadow-lg w-full animate-pulse"
        >
          <div className="h-48 bg-gray-200"></div>
          <div className="px-6 pt-4">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  try {
    const { results } = await fetchPages({});
    const pages = results || [];

    // 記事が0件の場合
    if (pages.length === 0) {
      return (
        <div className="pt-12">
          <EmptyState />
        </div>
      );
    }

    return (
      <div className="pt-12">
        <div className="grid gap-6 mt-8 w-full my-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pages.map((page: PageType, index: number) => (
            <CardOptimized
              key={page.id}
              page={page}
              priority={index < 4} // 最初の4枚の画像には priority を設定
              index={index} // インデックスを追加
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in home page:", error);

    // エラー時のフォールバック
    return (
      <div className="pt-12">
        <HomeError error={error as Error} />
      </div>
    );
  }
}
