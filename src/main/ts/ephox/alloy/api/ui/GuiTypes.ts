import { Objects } from '@ephox/boulder';
import { Fun, Id, Option } from '@ephox/katamari';

import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { PremadeSpec, AlloySpec } from '../../api/component/SpecTypes';

const premadeTag = Id.generate('alloy-premade');
const _apiConfig = Id.generate('api');

const premade = (comp: AlloyComponent): PremadeSpec => {
  return Objects.wrap(premadeTag, comp);
};

const getPremade = (spec: AlloySpec): Option<AlloyComponent> => {
  return Objects.readOptFrom(spec, premadeTag);
};

const makeApi = (f) => {
  return FunctionAnnotator.markAsSketchApi((component, ...rest/*, ... */) => {
    const spi = component.config(_apiConfig);
    return f.apply(undefined, [ spi ].concat([ component ].concat(rest)));
  }, f);
};

const apiConfig = Fun.constant(_apiConfig);

export {
  apiConfig,
  makeApi,
  premade,
  getPremade
};