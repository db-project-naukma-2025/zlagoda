import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "function-expression",
        },
      ],
      "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. Side effect imports (e.g., polyfills, global CSS)
            ["^\\u0000"],
            // 2. Node.js builtins
            ["^node:"],
            // 3. Packages (react, etc.)
            ["^@?\\w"],
            // 4. Absolute imports (e.g., /src/foo)
            ["^/"],
            // 5. Relative imports (not assets or styles)
            ["^\\.(?!.*\\.(css|scss|sass|less|styl|svg|png|jpe?g|gif|webp)$)"],
            // 6. Asset imports (svg, png, jpg, etc.)
            ["^.+\\.(svg|png|jpe?g|gif|webp)$"],
            // 7. Style imports (css, scss, etc.) - always last
            ["^.+\\.(css|scss|sass|less|styl)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "consistent-return": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
