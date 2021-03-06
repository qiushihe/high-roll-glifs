import path from "path";

import { DefinePlugin } from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
  entry: {
    bundle: path.resolve(__dirname, "src", "index.tsx")
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build")
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
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
      template: path.resolve(__dirname, "src", "template", "index.html"),
      filename: "index.html",
      hash: true,
      xhtml: true
    })
  ]
};
