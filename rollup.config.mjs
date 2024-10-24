import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import svgr from "@svgr/rollup";

export default {
  input: "src/index.tsx",
  output: {
    file: "content.js",
    format: "iife",
  },
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
    }),
    commonjs(),
    resolve({
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
    replace({
      preventAssignment: false,
      "process.env.NODE_ENV": `"${process.env.ENV}"`,
    }),
    terser(),
    svgr(),
  ],
};
