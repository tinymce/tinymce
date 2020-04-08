import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Arr, Fun } from '@ephox/katamari';

import { AlloyBehaviourRecord, derive, NamedConfiguredBehaviour } from '../../api/behaviour/Behaviour';

export interface SketchBehaviours {
  dump: AlloyBehaviourRecord;
}

const field = (name: string, forbidden: Array<{ name: () => string }>): FieldProcessorAdt =>
  FieldSchema.defaultedObjOf(name, { }, Arr.map(
    forbidden,
    (f) => FieldSchema.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name)
  ).concat([
    FieldSchema.state('dump', Fun.identity)
  ]));

const get = (data: SketchBehaviours): AlloyBehaviourRecord => data.dump;

const augment = (data: SketchBehaviours, original: Array<NamedConfiguredBehaviour<any, any>>): AlloyBehaviourRecord => ({
  ...data.dump,
  ...derive(original)
});

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
