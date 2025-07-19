import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    plugins: ["@typescript-eslint"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["off"],
      "@typescript-eslint/no-explicit-any": ["warn"],
      "@typescript-eslint/no-non-null-asserted-optional-chain": ["warn"],
      "@typescript-eslint/no-unused-expressions": ["off"],
    },
  }),
];

export default eslintConfig;
