import React from "react";

type DividerBlockRendererProps = {
  block: any;
};

export const DividerBlockRenderer: React.FC<DividerBlockRendererProps> = () => {
  return (
    <div className="nbr-block-divider">
      <div className="my-6">
        <hr className="border-t border-gray-300" />
      </div>
    </div>
  );
};
