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
        sans: ["var(--font-noto-sans-jp)", "system-ui", "sans-serif"],
      },
      colors: {
        // 必要に応じてカスタム色を追加
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "inherit",
            a: {
              color: "inherit",
              textDecoration: "none",
            },
            code: {
              color: "inherit",
              backgroundColor: "inherit",
            },
          },
        },
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
  safelist: [
    // 動的に生成される可能性のあるクラス
    "nbr-bold",
    "nbr-italic",
    "nbr-underline",
    "nbr-inline-code",
    // KaTeXのスタイルに必要なクラス
    "katex",
    "math-inline",
    "math-block",
    // Notion画像と動画のラッパークラス
    "nbr-block-image",
    "nbr-block-video",
    // ブレッドクラムのナビゲーションクラス
    "breadcrumb",
  ],
  future: {
    hoverOnlyWhenSupported: true, // タッチデバイスでのホバー状態を改善
    respectDefaultRingColorOpacity: true,
  },
  corePlugins: {
    preflight: true, // スタイルのリセットを有効化 (必要に応じて調整)
    container: true,
  },
};

export default config;
