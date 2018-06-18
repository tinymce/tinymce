import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Arr, Fun } from '@ephox/katamari';

import { AlloyBehaviour, AlloyBehaviourRecord, ConfiguredBehaviour } from '../../api/behaviour/Behaviour';
import { ContainerBehaviours } from '../../spec/SpecSchema';

export interface SketchBehaviours {
  dump: () => AlloyBehaviourRecord;
}

const field = (name: string, forbidden: AlloyBehaviour<any,any>[]): FieldProcessorAdt => {
  return FieldSchema.defaultedObjOf(name, { }, Arr.map(forbidden, (f) => {
    return FieldSchema.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
  }).concat([
    FieldSchema.state('dump', Fun.identity)
  ]));
};

const get = (data: SketchBehaviours): AlloyBehaviourRecord => {
  return data.dump();
};

export {
  field,
  get
};