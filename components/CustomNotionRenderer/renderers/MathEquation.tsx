"use client";

import React from "react";
import { InlineMath } from "react-katex";

interface MathEquationProps {
  expression: string;
}

const MathEquation: React.FC<MathEquationProps> = ({ expression }) => {
  try {
    return (
      <span className="math-inline">
        <InlineMath math={expression} />
      </span>
    );
  } catch (error) {
    console.error("Error rendering equation:", error);
    return <span className="text-red-500">{expression}</span>;
  }
};

export default MathEquation;
