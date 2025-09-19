/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:import/recommended",
    "plugin:tailwindcss/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "tailwindcss", "simple-import-sort"],
  rules: {
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/classnames-order": "off",
    "no-unused-vars": "off", //turn off the default unused vars rule
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ], // turn on the eslint unused vars rule
    "import/no-unresolved": "error",
    "import/named": "error",
    quotes: ["error", "double"],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: ["./tsconfig.json"],
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      extends: [
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended",
        "plugin:tailwindcss/recommended",
        //'plugin:@typescript-eslint/recommended-type-checked',
        // 'plugin:@typescript-eslint/strict-type-checked',
        // 'plugin:@typescript-eslint/stylistic-type-checked',
      ],
      rules: {
        "tailwindcss/no-custom-classname": "off",
        "tailwindcss/classnames-order": "off",
        "no-unused-vars": "off", //turn off the default unused vars rule
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ], // turn on the eslint unused vars rule
        "import/no-unresolved": "error",
        "import/named": "error",
        quotes: ["error", "double"],
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
      },
    },
  ],
};
