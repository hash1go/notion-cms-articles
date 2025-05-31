import NotionImageOptimized from "@/components/notion/NotionImageOptimized";
import Link from "next/link";
import React, { FC } from "react";
import { CardProps } from "@/types";
import { getCover, getDate, getMultiSelect, getText } from "@/lib/utils/property";

const CardOptimized: FC<CardProps & { priority?: boolean; index?: number }> = ({
  page,
  priority = false,
  index = 0,
}) => {
  return (
    <Link
      href={`/articles/${getText(page.properties.slug.rich_text)}`}
      className="flex justify-center"
      prefetch={priority} // 優先度の高いカードはプリフェッチ
    >
      <div className="max-w-sm rounded overflow-hidden shadow-lg w-full my-4 md:my-0 content-between grid">
        {/* image */}
        <div>
          <NotionImageOptimized
            className="w-full h-48 object-cover rounded-t"
            src={getCover(page.cover)}
            alt={getText(page.properties.name.title)}
            width={400}
            height={300}
            quality={60}
            priority={priority}
            index={index} // インデックスを渡す
            style={{ objectFit: "cover" }}
            pageId={page.id}
          />
        </div>

        {/* title & date*/}
        <div className="px-6 pt-4">
          <h2 className="text-base font-medium mb-3">
            {getText(page.properties.name.title)}
          </h2>
          {page.properties.date.date && (
            <p className="text-gray-700 text-xs">
              <time dateTime={page.properties.date.date.start}>
                {getDate(page.properties.date.date)}
              </time>
            </p>
          )}
        </div>

        {/* tag */}
        <div className="px-6 pb-4 flex flex-wrap">
          {getMultiSelect(page.properties.tags.multi_select).map(
            (tag, index) => (
              <span
                key={index}
                className="text-sm px-2 py-1 font-normal bg-gray-200 rounded-lg whitespace-nowrap mr-2 mb-2"
              >
                {`#${tag}`}
              </span>
            )
          )}
        </div>
      </div>
    </Link>
  );
};

export default CardOptimized;
