const dummyInstrument = () => val => val;

export default {
  instrument: window.__REDUX_DEVTOOLS_EXTENSION__ || dummyInstrument
};
