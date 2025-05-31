import { NotionRichText, PageProperties, NotionFile } from "@/types/notion-api";
import { logger } from "@/lib/logger";

export const getText = (richTextArr: NotionRichText[] | undefined): string => {
  if (!richTextArr || !Array.isArray(richTextArr)) {
    return "";
  }

  try {
    const textArr = richTextArr.map((richText) => richText.plain_text);
    return textArr.join("");
  } catch (err) {
    logger.warn("Error extracting text from rich text array", err);
    return "";
  }
};

export const getCover = (cover: NotionFile | null | undefined): string => {
  if (!cover) return "/noimage.png";

  if (cover.type === "file" && cover.file?.url) {
    return cover.file.url;
  }
  if (cover.type === "external" && cover.external?.url) {
    return cover.external.url;
  }

  return "/noimage.png";
};

export const getDate = (
  date: PageProperties["date"]["date"] | undefined
): string => {
  if (!date || !date.start) {
    return "-";
  }

  try {
    return date.start;
  } catch (err) {
    logger.warn("Error extracting date", err);
    return "-";
  }
};

export const getMultiSelect = (
  multiSelect: PageProperties["tags"]["multi_select"] | undefined
): string[] => {
  if (!multiSelect || !Array.isArray(multiSelect)) {
    return [];
  }

  try {
    return multiSelect.map((tag) => tag.name);
  } catch (err) {
    logger.warn("Error extracting multi-select values", err);
    return [];
  }
};
