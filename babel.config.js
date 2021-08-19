const resolvePath = require("path").resolve;

module.exports = {
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-proposal-optional-chaining",
    "babel-plugin-styled-components",
    [
      "module-resolver",
      {
        root: __dirname,
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        alias: {
          "/src": resolvePath(__dirname, "src"),
          "/test": resolvePath(__dirname, "test")
        }
      }
    ]
  ],
  presets: [
    "@babel/preset-env",
    "@babel/preset-react",
    "@babel/preset-typescript"
  ]
};
