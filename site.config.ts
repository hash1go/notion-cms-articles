import { SiteConfig } from "@/types";

/**
 * Site Configuration File
 * Configure site-wide settings and social media links.
 */
export const siteConfig: SiteConfig = {
  // Language code (e.g., "ja" for Japanese, "en" for English)
  lang: "",

  // The title of your website
  title: "",

  // A short description of your site
  description: "",

  // Social media URLs
  twitterUrl: "", // Twitter profile URL (leave empty if not used)
  farcasterUrl: "", // Farcaster profile URL (leave empty if not used)
  instagramUrl: "", // Instagram profile URL (leave empty if not used)
  githubUrl: "", // GitHub profile URL (leave empty if not used)
  discordId: "", // Discord user ID (leave empty if not used)

  // Twitter username without @ for metadata (leave empty if not used)
  twitterUsername: "",

  // Default image for social sharing (path from public directory)
  defaultImage: "/site-cover.png",

  // Administrator's name for display purposes (e.g., used in social media links and footer)
  adminName: "",

  // Copyright information
  copyright: "", // Copyright text to display
  copyrightUrl: "", // URL for copyright details (if applicable)

  // Messages used on error or navigation pages
  notFoundMessage: "", // Message displayed on the 404 page (default: "Page not found")
  notFoundTitle: "", // Title for the 404 page (default: "Page Not Found | 404 Error")
  notFoundDescription: "", // Meta description for the 404 page (default: "The page you are looking for could not be found.")
  returnToHome: "", // Label for the link to return to the homepage (default: "Return to Home")
};
