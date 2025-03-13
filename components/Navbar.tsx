"use client";

import Link from "next/link";
import React from "react";
import { siteConfig } from "@/site.config";
import Breadcrumb from "./Breadcrumb";

const Navbar = () => {
  return (
    <header className="w-full bg-white border-b border-gray-100 py-4">
      <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
        <div className="flex items-center">
          <Link
            href="/"
            className="font-semibold text-gray-800 text-lg md:text-xl hover:text-gray-700 transition-colors duration-200"
          >
            {siteConfig.title}
          </Link>
        </div>

        <div className="mt-2 w-full md:w-auto md:mt-0">
          <Breadcrumb />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
