import get from "lodash/get";

const dummyInstrument = () => (val: unknown): unknown => val;

export default {
  instrument: get(window, "__REDUX_DEVTOOLS_EXTENSION__") || dummyInstrument
};
