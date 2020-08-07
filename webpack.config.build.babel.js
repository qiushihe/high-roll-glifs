import merge from "webpack-merge";

import common from "./webpack.config.common.babel.js";

export default merge(common, {
  mode: "production",
  output: {
    publicPath: "/high-roll-glifs/"
  }
});
