export default [
  { ignores: ["dist", "coverage", "node_modules"] },
  {
    files: ["src/frontend/**/*.{js,jsx}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "no-irregular-whitespace": "error",
      "prefer-const": "error",
    },
  },
];
