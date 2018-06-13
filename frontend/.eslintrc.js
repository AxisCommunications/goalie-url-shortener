module.exports = {
  env: {
    browser: true,
    jest: true
  },
  parser: "babel-eslint",
  plugins: ["react", "prettier"],
  rules: {
    "prettier/prettier": "error"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      modules: true
    }
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "airbnb-base",
    "plugin:prettier/recommended"
  ]
};

// yarn add --dev babel-eslint eslint-config-airbnb-base eslint-plugin-react
