module.exports = {
  env: {
    browser: true,
    es2023: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },

  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx"],
      },
    },
  },

  plugins: ["react", "unused-imports", "simple-import-sort", "import"],

  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
  ],

  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",

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

    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",

    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
  },
};
