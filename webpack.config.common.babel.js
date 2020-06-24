import { resolve as resolvePath } from "path";

import { DefinePlugin } from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
  entry: {
    bundle: "./src/index.jsx"
  },
  output: {
    filename: "[name].js",
    path: resolvePath(__dirname, "build")
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  plugins: [
    new CleanWebpackPlugin(),

    new DefinePlugin({
      "process.env.DUMMY_ENV": JSON.stringify(process.env.DUMMY_ENV)
    }),

    new HtmlWebpackPlugin({
      excludeChunks: [],
      template: "./src/template/index.html",
      filename: "index.html",
      hash: true,
      xhtml: true
    })
  ]
};
