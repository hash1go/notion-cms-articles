import React, { FC } from "react";
import Link from "next/link";
import NotionImage from "@/components/NotionImage";
import { ArticleMetaProps } from "@/types";
import { getCover, getDate, getMultiSelect, getText } from "@/utils/property";
import Author from "./Author";
import { authors } from "@/author.config";
import { metaConfig } from "@/meta.config";

const ArticleMeta: FC<ArticleMetaProps> = ({ page }) => {
  const showMeta =
    metaConfig.author.display ||
    metaConfig.date.display ||
    metaConfig.url.display ||
    metaConfig.tags.display;

  const authorName = getText(page.properties.author.rich_text);
  const authorInfo = authors.find((t) => t.id === authorName);

  return (
    <>
      {/* カバー画像 */}
      <div className="flex justify-center my-4">
        <div className="w-full max-w-screen-lg aspect-video relative overflow-hidden rounded-lg bg-gray-100">
          <NotionImage
            className="absolute inset-0 w-full h-full"
            src={getCover(page.cover)}
            alt={getText(page.properties.name.title) || ""}
            style={{ objectFit: "cover" }}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 1200px"
            quality={60}
            priority={true}
            pageId={page.id}
          />
        </div>
      </div>

      {/* タイトル */}
      <h1 className="article-title my-8 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
        {getText(page.properties.name.title)}
      </h1>
      {/* メタ情報ブロック：どれか1つでも表示設定が true なら描画 */}
      {showMeta && (
        <div className="bg-gray-50 px-6 py-4 rounded text-sm text-gray-600">
          <div className="grid grid-cols-3 gap-4">
            {metaConfig.author.display && (
              <>
                <div className="col-span-1 flex items-center">
                  {metaConfig.author.label.trim() || "author"}
                </div>
                <div className="col-span-2 flex items-center">
                  <Author authorName={authorName} authorInfo={authorInfo} />
                </div>
              </>
            )}

            {metaConfig.date.display && (
              <>
                <div className="col-span-1 flex items-center">
                  {metaConfig.date.label.trim() || "date"}
                </div>
                <div className="col-span-2">
                  <time dateTime={page.properties.date.date.start}>
                    {getDate(page.properties.date.date)}
                  </time>
                </div>
              </>
            )}

            {metaConfig.url.display && (
              <>
                <div className="col-span-1 flex items-start">
                  {metaConfig.url.label.trim() || "url"}
                </div>
                <div className="col-span-2 break-words whitespace-pre-wrap">
                  {(() => {
                    const urlText = getText(page.properties.url.rich_text);
                    let isValidUrl = false;
                    try {
                      if (urlText && new URL(urlText)) {
                        isValidUrl = true;
                      }
                    } catch (error) {
                      isValidUrl = false;
                    }
                    return isValidUrl ? (
                      <a
                        href={urlText}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {urlText}
                      </a>
                    ) : (
                      <span>{urlText}</span>
                    );
                  })()}
                </div>
              </>
            )}

            {metaConfig.tags.display && (
              <>
                <div className="col-span-1 flex items-center">
                  {metaConfig.tags.label.trim() || "tags"}
                </div>
                <div className="col-span-2 flex flex-wrap">
                  {getMultiSelect(page.properties.tags.multi_select).map(
                    (tag: string, index: number) => (
                      <Link
                        key={index}
                        href={`/tags/${tag}`}
                        className="text-gray-600 no-underline border-b border-solid border-gray-600 opacity-90 mr-3 whitespace-nowrap"
                      >
                        <span>{`#${tag}`}</span>
                      </Link>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleMeta;
