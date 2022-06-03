import merge from "webpack-merge";

import common from "./webpack.config.common.babel.js";

export default merge(common, {
  mode: "development",
  devtool: "source-map",
  output: {
    publicPath: "/"
  },
  devServer: {
    port: 3000,
    allowedHosts: "all",
    hot: true,
    devMiddleware: {
      writeToDisk: true
    },
    historyApiFallback: {
      index: "/index.html"
    }
  }
});
