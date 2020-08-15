const resolvePath = require("path").resolve;

module.exports = {
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-syntax-object-rest-spread",
    "@babel/plugin-proposal-object-rest-spread",
    "babel-plugin-styled-components",
    [
      "module-resolver",
      {
        root: __dirname,
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
