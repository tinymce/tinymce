import FunctionAnnotator from '../../debugging/FunctionAnnotator';
import { Objects } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Id } from '@ephox/katamari';

var premadeTag = Id.generate('alloy-premade');
var apiConfig = Id.generate('api');


var premade = function (comp) {
  return Objects.wrap(premadeTag, comp);
};

var getPremade = function (spec) {
  return Objects.readOptFrom(spec, premadeTag);
};

var makeApi = function (f) {
  return FunctionAnnotator.markAsSketchApi(function (component/*, ... */) {
    var args = Array.prototype.slice.call(arguments, 0);
    var spi = component.config(apiConfig);
    return f.apply(undefined, [ spi ].concat(args));
  }, f);
};

export default <any> {
  apiConfig: Fun.constant(apiConfig),
  makeApi: makeApi,
  premade: premade,
  getPremade: getPremade
};