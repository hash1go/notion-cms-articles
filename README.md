# notion-cms-articles

A minimal blogging platform built with Next.js and powered by Notion API, featuring support for math equations, code highlighting, and responsive design.

## Features

- 📝 Notion as a headless CMS
- 🧮 KaTeX math equations support
- 🌈 Syntax highlighting for code blocks
- 📱 Responsive design with Tailwind CSS
- 🖼️ Image optimization
- 🏷️ Tag-based article categorization

## Setup

### Prerequisites

- Node.js
- Notion account
- Notion integration with API key

### Quick Start

1. Clone the repository:

```bash
git clone https://github.com/hash1go/notion-cms-articles.git
cd notion-cms-articles
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables file and configure it:

```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your Notion API credentials:

```
NOTION_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
NEXT_PUBLIC_SITE_URL=https://example.com
```

5. Configure the required configuration files:

This project uses several configuration files that must be properly set up:
   - `site.config.ts`: Main site information, social links, and titles
   - `author.config.ts`: Author information for article attribution
   - `meta.config.ts`: Controls what metadata displays on article pages

Without these configurations properly set, the blog won't function correctly. See the [Configuration](#configuration) section below for detailed setup instructions.

6. Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see your blog.

## How It Works

This diagram illustrates the flow of data from Notion to your browser with the App Router architecture:

```
┌─────────────┐     ┌─────────────────┐     ┌───────────────┐     ┌──────────────┐
│             │     │                 │     │               │     │              │
│   Notion    │────▶│  Next.js Server │────▶│  React Server │────▶│   Browser    │
│   Database  │     │  Components     │     │  Components   │     │   Display    │
│             │     │                 │     │               │     │              │
└─────────────┘     └─────────────────┘     └───────────────┘     └──────────────┘
       │                     │                     │                      ▲
       │                     │                     │                      │
       │                     ▼                     ▼                      │
       │             ┌─────────────────┐  ┌────────────────────┐          │
       │             │                 │  │                    │          │
       └────────────▶│  Notion API     │  │ CustomNotionRenderer│─────────┘
                     │  Integration    │  │                    │
                     │                 │  │                    │
                     └─────────────────┘  └────────────────────┘
```

### Data Flow Process

1. **Content Creation**: You create and maintain your content in Notion databases

2. **Data Fetching**: Using Server Components and Cache:
   - Pages are rendered on the server with React Server Components
   - Server components fetch data from Notion API using your integration credentials
   - Data fetching is optimized with Next.js cache strategies and revalidation
   - Content is automatically refreshed based on your revalidation interval (default: 60 seconds)

3. **Content Processing**:
   - Page metadata (title, date, tags, etc.) is extracted by server components
   - Block content is processed by CustomNotionRenderer (client component)
   - Mathematical equations, code snippets, and images are specially handled with optimized rendering

4. **Rendering**:
   - Server Components render the initial HTML on the server
   - Client Components handle interactive elements like navigation and dynamic content
   - React Suspense manages loading states for dynamic imports

5. **Optimization**:
   - Images are optimized through Next.js Image component with automatic sizing
   - Code is highlighted with syntax highlighting (on client)
   - Math equations are rendered with KaTeX (on client)

6. **Delivery**:
   - Initial HTML is sent to the browser (fast initial load)
   - Client-side hydration adds interactivity where needed
   - The user sees your Notion content as a beautifully styled blog

This architecture allows you to use Notion as a CMS while presenting your content with custom design and enhanced features, leveraging the performance benefits of Next.js App Router and React Server Components.

## Notion Setup

### Database Requirements

Create a Notion database with the following properties:

- `name` (title): Article title
- `tags` (multi-select): Article categories
- `slug` (text): URL slug for the article
- `author` (text): Article author
- `url` (text): Optional external link
- `description` (text): Article summary
- `isPublic` (checkbox): Whether the article is published
- `date` (date): Publication date

### Cover Images

Add a cover image to your Notion pages to display as featured images on your blog.

## Configuration

This project uses several configuration files to customize different aspects of the blog:

### 1. Basic Configuration Files

#### `site.config.ts`

Main site configuration including metadata, social links, and UI text:

```typescript
export const siteConfig: SiteConfig = {
  // Language code (e.g., "ja" for Japanese, "en" for English)
  lang: "en",
  
  // The title of your website
  title: "Your Blog Title",
  
  // A short description of your site
  description: "Your blog description",
  
  // Social media URLs
  twitterUrl: "your Twitter URL", // e.g., https://twitter.com/yourusername
  farcasterUrl: "your Farcaster URL", // e.g., https://warpcast.com/yourusername
  instagramUrl: "your Instagram URL", // e.g., https://instagram.com/yourusername
  githubUrl: "your GitHub URL", // e.g., https://github.com/yourusername
  discordId: "your Discord ID", // e.g., yourdiscordusername (without #)
  
  // Twitter username without @ for metadata
  twitterUsername: "your Twitter username",
  
  // Default image for social sharing (path from public directory)
  defaultImage: "/site-cover.png",
  
  // Administrator's name for display purposes
  adminName: "Your Name",
  
  // Copyright information
  copyright: "2025 Your Name",
  copyrightUrl: "your copyright URL",
  
  // Error page customization
  notFoundMessage: "Page not found",
  notFoundTitle: "Page Not Found | 404 Error",
  notFoundDescription: "The page you are looking for could not be found.",
  returnToHome: "Return to Home"
};
```

#### `author.config.ts`

Author information for article attribution:

```typescript
export const authors: AuthorInfo[] = [
  {
    // Your name for the author
    id: "your-author-name",
    // URL to the author's Twitter profile
    twitterUrl: "your Twitter URL",
    // URL to the author's profile image
    icon: "your author image URL", 
  },
  // Add more authors as needed
];
```

#### `meta.config.ts`

Configure the display settings for metadata on article pages:

```typescript
export const metaConfig = {
  author: {
    display: true, // Set to false if you do not want to display the author
    label: "Author", // Custom label for author metadata
  },
  date: {
    display: true, // Set to false if you do not want to display publication date
    label: "Published", // Custom label for date metadata
  },
  url: {
    display: true, // Set to false if you do not want to display URL
    label: "External Link", // Custom label for URL metadata
  },
  tags: {
    display: true, // Set to false if you do not want to display tags
    label: "Tags", // Custom label for tags metadata
  },
};
```

### 2. Styling Configuration

#### `tailwind.config.ts`

Customize the styling of your blog with Tailwind CSS:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["your-preferred-font", "system-ui", "sans-serif"],
      },
      colors: {
        // Add custom colors if needed
      },
    },
  },
  plugins: [],
};

export default config;
```

#### Font Configuration

This blog uses Google Fonts (Noto Sans JP by default). To customize fonts:

1. First, import your preferred font in `app/layout.tsx`:

```tsx
// In app/layout.tsx
import { YourPreferredFont } from "next/font/google";

const yourFont = YourPreferredFont({
  subsets: ["latin"],
  weight: ["400", "700"],
  // other font options
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      {/* ... */}
  );
}
```

2. Then, update the `tailwind.config.ts` to use your font:

```typescript
// ... tailwind font configuration
```

### 3. Technical Configuration

#### `next.config.js`

Configure Next.js settings, especially for image domains:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Notion's default image source
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
        // IMPORTANT:
        // This hostname is used to fetch images stored by Notion.
        // If your images are saved in a different domain,
        // please check the image URL in your Notion pages and update this hostname accordingly.
        // An incorrect domain here will cause image fetching to fail.
      },
      // Add any other domains you need for images
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

    // Redirect Configuration
    // This section defines URL redirects for the application.
    // - /articles -> / (home)
    // - /tags -> / (home)
    // No additional redirects should be necessary for basic functionality.
    async redirects() {
    return [
      {
        source: "/articles",
        destination: "/",
        permanent: true,
      },
      {
        source: "/tags",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

Each configuration file serves a specific purpose to make your blog customizable without touching the core code.

#### Image Domain Configuration

Your Notion images require configuration in two places to ensure optimal loading:

1. First, in `next.config.js` as shown above to allow Next.js Image Optimization.

2. Then, in `app/layout.tsx` to enable DNS prefetching for faster image loading:

```tsx
// In app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.lang}>
      <head>
        {/* Preconnect to Notion domains for faster image loading */}
        <link rel="preconnect" href="https://www.notion.so" />
        <link
          rel="preconnect"
          href="https://prod-files-secure.s3.us-west-2.amazonaws.com"
        />
        {/* Optional: Add this if you frequently use Unsplash images in your Notion pages */}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={someFont.className}>
        {/* Your site layout components */}
        {children}
      </body>
    </html>
  );
}
```

**Important:** If you modify the domains in `next.config.js`, ensure you update the corresponding preconnect links in `layout.tsx` to match. This dual configuration ensures both proper image rendering and optimal loading performance.

#### Environment Variables

Make sure your `.env.local` file contains the necessary API credentials:

```
NOTION_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
NEXT_PUBLIC_SITE_URL=https://example.com
```

Each configuration file serves a specific purpose to make your blog customizable without touching the core code.

## Deployment

This blog can be deployed on various platforms. Here are some common options:

### Deploy to Vercel

While Vercel offers a straightforward deployment process:

```bash
vercel
```

**Note:** Be aware that Vercel's free tier has limitations on Next.js Image Optimization API usage. If your blog contains many images, you might reach these limits quickly.

### Deploy to AWS Amplify

This Next.js application also works well with AWS Amplify. To deploy:

1. Set up your Amplify project in the AWS console
2. Connect your repository
3. Configure your `amplify.yml` file properly, especially for environment variables handling

**Important:** Research the correct `amplify.yml` configuration for Next.js applications, as it requires specific build settings.

### Environment Variables

For any deployment platform, remember to:

1. Set up environment variables in the platform's console/dashboard
2. Never commit your `.env` files to your repository
3. Make sure your environment variables are properly configured in your deployment environment

Each platform has its own method for setting environment variables, so check their documentation for specific instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.# notion-cms-articles
