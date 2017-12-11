import PropertySteps from '../arbitrary/PropertySteps';

// Maybe wrap in the same way Jsc does for console output with ticks and crosses.
var sAsyncProperty = function (name, arbitraries, statefulStep, _options) {
  return PropertySteps.sAsyncProperty(name, arbitraries, statefulStep, _options);
};

export default <any> {
  sAsyncProperty: sAsyncProperty
};