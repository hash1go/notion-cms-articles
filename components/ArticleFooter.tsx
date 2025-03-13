import { PageType } from "@/types";
import Card from "@/components/Card";
import Link from "next/link";
import { siteConfig } from "@/site.config";

interface ArticleFooterProps {
  relatedPosts?: PageType[];
}

const ArticleFooter: React.FC<ArticleFooterProps> = ({ relatedPosts = [] }) => {
  return (
    <div className="mt-16 mb-8">
      {/* 区切り線 */}
      <div className="border-t border-gray-200 pt-8 mb-8"></div>

      {/* 関連記事がある場合は表示 */}
      {relatedPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">関連記事</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {relatedPosts.map((post, index) => (
              <Card key={index} page={post} />
            ))}
          </div>
        </div>
      )}

      {/* ホームに戻るボタンを中央配置 */}
      <div className="flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {siteConfig.returnToHome || "Return to Home"}
        </Link>
      </div>
    </div>
  );
};

export default ArticleFooter;
