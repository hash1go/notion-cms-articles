/**
 * Meta Configuration File
 *
 * This file configures the display settings for meta information on article pages.
 *
 * You can use these label fields to provide custom descriptions.
 * For example, if you want to display a custom label for the URL meta (instead of just "url"),
 * you can populate the "label" field with your desired text.
 */
export const metaConfig = {
  author: {
    display: true, // Set to false if you do not want to display the author meta information.
    label: "", // Optionally provide a custom label. Leave empty to use the default key.
  },
  date: {
    display: true, // Set to false if you do not want to display the publication date.
    label: "", // Optionally provide a custom label. Leave empty to use the default key.
  },
  url: {
    display: true, // Set to false if you do not want to display the URL meta information.
    label: "", // Optionally provide a custom label. Leave empty to use the default key.
  },
  tags: {
    display: true, // Set to false if you do not want to display the tags meta information.
    label: "", // Optionally provide a custom label. Leave empty to use the default key.
  },
};
