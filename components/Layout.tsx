import React, { FC } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { ExtendedLayoutProps } from "@/types";

const Layout: FC<ExtendedLayoutProps> = ({ children, variant = "default" }) => {
  const containerClass =
    variant === "article"
      ? "flex flex-col max-w-2xl items-center w-full mx-auto"
      : "flex flex-col items-center w-full mx-auto md:max-w-4xl lg:max-w-6xl xl:max-w-screen-xl";

  return (
    <div className="relative overflow-hidden px-3 sm:px-4">
      <div className={containerClass}>
        <Navbar />
        <main className="w-full pb-12 px-1 sm:px-2">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
