import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Arr, Fun } from '@ephox/katamari';

import { AlloyBehaviourRecord, derive, NamedConfiguredBehaviour } from '../../api/behaviour/Behaviour';

export interface SketchBehaviours {
  dump: AlloyBehaviourRecord;
}

const field = (name: string, forbidden: Array<{ name: () => string }>): FieldProcessorAdt => {
  return FieldSchema.defaultedObjOf(name, { }, Arr.map(forbidden, (f) => {
    return FieldSchema.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
  }).concat([
    FieldSchema.state('dump', Fun.identity)
  ]));
};

const get = (data: SketchBehaviours): AlloyBehaviourRecord => {
  return data.dump;
};

const augment = (data: SketchBehaviours, original: Array<NamedConfiguredBehaviour<any, any>>): AlloyBehaviourRecord => {
  return {
    ...data.dump,
    ...derive(original)
  };
};

// Is this used?
export const SketchBehaviours = {
  field,
  augment,
  get
};

export {
  field,
  get,
  augment
};
