import { Objects } from '@ephox/boulder';
import { Id, Option } from '@ephox/katamari';

import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { PremadeSpec, AlloySpec } from '../../api/component/SpecTypes';

const premadeTag = Id.generate('alloy-premade');

const premade = (comp: AlloyComponent): PremadeSpec => {
  return Objects.wrap(premadeTag, comp);
};

const getPremade = (spec: AlloySpec): Option<AlloyComponent> => {
  return Objects.readOptFrom<AlloyComponent>(spec, premadeTag);
};

const makeApi = (f) => {
  return FunctionAnnotator.markAsSketchApi((component: AlloyComponent, ...rest/*, ... */) => {
    return f.apply(undefined, [ component.getApis<any>() ].concat([ component ].concat(rest)));
  }, f);
};

export {
  makeApi,
  premade,
  getPremade
};
