import React, { FC } from "react";
import { BlockProps } from "@/types";
import { getText } from "@/lib/utils/property";
import {
  isHeading1Block,
  isHeading2Block,
  isHeading3Block,
  isParagraphBlock,
  isFullBlock,
} from "@/types/notion-api";

const Block: FC<BlockProps> = ({ block }) => {
  if (!isFullBlock(block)) {
    return null;
  }

  switch (block.type) {
    case "heading_1":
      if (isHeading1Block(block)) {
        return <h1>{getText(block.heading_1.rich_text)}</h1>;
      }
      break;
    case "heading_2":
      if (isHeading2Block(block)) {
        return <h2>{getText(block.heading_2.rich_text)}</h2>;
      }
      break;
    case "heading_3":
      if (isHeading3Block(block)) {
        return <h3>{getText(block.heading_3.rich_text)}</h3>;
      }
      break;
    case "paragraph":
      if (isParagraphBlock(block)) {
        return <p>{getText(block.paragraph.rich_text)}</p>;
      }
      break;
    default:
      console.log(`unknown block type: ${block.type}`);
      return <></>;
  }

  return <></>;
};

export default Block;
