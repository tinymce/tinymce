import { Objects } from '@ephox/boulder';
import { Fun, Id, Option } from '@ephox/katamari';

import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { PremadeSpec, AlloySpec } from '../../api/component/SpecTypes';

const premadeTag = Id.generate('alloy-premade');
const _apiConfig = Id.generate('api');

const premade = function (comp: AlloyComponent): PremadeSpec {
  return Objects.wrap(premadeTag, comp);
};

const getPremade = function (spec: AlloySpec): Option<AlloyComponent> {
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