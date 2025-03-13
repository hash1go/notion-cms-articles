import { ReactNode } from "react";

export type LayoutVariant = "article" | "default";

export type LayoutProps = {
  children: ReactNode;
};

export type ExtendedLayoutProps = LayoutProps & {
  variant?: LayoutVariant;
};
