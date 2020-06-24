import { convert as convertReduce } from "lodash/fp/reduce";
import isFunction from "lodash/fp/isFunction";

const uncappedReduce = convertReduce({ cap: false });

export const withProps = moreProps => selector => (state, ownProps) =>
  selector(state, {
    ...ownProps,
    ...uncappedReduce((result, value, name) => {
      return {
        ...result,
        [name]: isFunction(value) ? value(state, ownProps) : value
      };
    }, {})(moreProps)
  });

export const fromProps = selector => (_, props) => selector(props);
