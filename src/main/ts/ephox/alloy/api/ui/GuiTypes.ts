import { Objects } from '@ephox/boulder';
import { Fun, Id, Option } from '@ephox/katamari';

import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { AlloyPremadeComponent } from 'ephox/alloy/api/component/GuiFactory';

const premadeTag = Id.generate('alloy-premade');
const _apiConfig = Id.generate('api');

const premade = function (comp: AlloyComponent): AlloyPremadeComponent {
  return Objects.wrap(premadeTag, comp);
};

const getPremade = function (spec): Option<AlloyComponent> {
  return Objects.readOptFrom(spec, premadeTag);
};

const makeApi = function (f) {
  return FunctionAnnotator.markAsSketchApi(function (component/*, ... */) {
    const args = Array.prototype.slice.call(arguments, 0);
    const spi = component.config(_apiConfig);
    return f.apply(undefined, [ spi ].concat(args));
  }, f);
};

const apiConfig = Fun.constant(_apiConfig);

export {
  apiConfig,
  makeApi,
  premade,
  getPremade
};