import React from "react";
import Image from "next/image";
import { AuthorProps } from "@/types";

const Author: React.FC<AuthorProps> = ({ authorName, authorInfo }) => {
  return (
    <div className="flex items-center">
      {authorInfo && authorInfo.icon && (
        <Image
          src={authorInfo.icon}
          alt={authorName}
          width={40}
          height={40}
          className="rounded-full mr-2"
        />
      )}
      {authorName && authorInfo && authorInfo.twitterUrl ? (
        <a
          href={authorInfo.twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 no-underline border-b border-solid border-gray-700 opacity-70 mr-3"
        >
          {authorName}
        </a>
      ) : (
        authorName
      )}
    </div>
  );
};

export default Author;
