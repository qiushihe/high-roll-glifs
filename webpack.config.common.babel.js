import path from "path";

import { DefinePlugin } from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import GoogleFontsPlugin from "@beyonk/google-fonts-webpack-plugin";

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
        exclude: (modulePath) => {
          return modulePath.startsWith(path.resolve(__dirname, "node_modules")) &&
            !modulePath.startsWith(path.resolve(__dirname, "node_modules", "@codemirror"));
        },
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

    new GoogleFontsPlugin({
      fonts: [
        { family: "Open Sans" },
        { family: "Source Code Pro" },
      ]
    }),

    new HtmlWebpackPlugin({
      excludeChunks: [],
      template: path.resolve(__dirname, "src", "template", "index.html"),
      filename: "index.html",
      hash: true,
      xhtml: true,
      templateParameters: {
        // This is default font CSS filename from GoogleFontsPlugin
        fontPath: "fonts.css"
      }
    })
  ]
};
