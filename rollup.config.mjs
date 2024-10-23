import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.tsx",
  output: {
    file: "content.js",
    format: "iife",
  },
  plugins: [
    resolve({
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
    commonjs(),
    replace({
      preventAssignment: false,
      "process.env.NODE_ENV": `"${process.env.ENV}"`,
    }),
    typescript({
      tsconfig: "tsconfig.json",
    }),
    terser(),
  ],
};
