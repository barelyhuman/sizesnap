import React from "react";
import { modsToStyle } from "spacery";

const Box = function ({ children, elm = "div", ...props }) {
  const { style, sanitizedProps } = modsToStyle(props, ""); // pass dimension as an empty string so it used the actual numbers

  return React.createElement(
    elm,
    {
      style: style,
      ...sanitizedProps,
    },
    children
  );
};

export default Box;
