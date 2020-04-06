import { Objects } from '@ephox/boulder';
import { Id, Obj, Option } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, PremadeSpec } from '../../api/component/SpecTypes';
import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';

const premadeTag = Id.generate('alloy-premade');

const premade = (comp: AlloyComponent): PremadeSpec => Objects.wrap(premadeTag, comp);

const getPremade = (spec: AlloySpec): Option<AlloyComponent> => Obj.get<any, string>(spec, premadeTag);

const makeApi = <A, R>(f: (api: A, comp: AlloyComponent, ...rest: any[]) => R) =>
  FunctionAnnotator.markAsSketchApi(
    (component: AlloyComponent, ...rest: any[]) => f(component.getApis(), component, ...rest),
    f
  );

export {
  makeApi,
  premade,
  getPremade
};
