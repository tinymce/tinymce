import { Arr, Obj } from '@ephox/katamari';
import { AlloyBehaviour, AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';

import * as BehaviourBlob from '../../behaviour/common/BehaviourBlob';

type BehaviourName = string;

// This goes through the list of behaviours defined for a particular spec (removing anything
// that has been revoked), and returns the BehaviourType (e.g. Sliding)
const getBehaviours = (spec: { behaviours?: AlloyBehaviourRecord }): Array<AlloyBehaviour<any, any, any>> => {
  const behaviours: AlloyBehaviourRecord = Obj.get(spec, 'behaviours').getOr({ });
  const keys = Arr.filter(
    Obj.keys(behaviours),
    (k: BehaviourName) => behaviours[k] !== undefined
  );
  return Arr.map(keys, (k) => behaviours[k].me);
};

const generateFrom = (spec: { behaviours?: AlloyBehaviourRecord }, all: Array<AlloyBehaviour<any, any, any>>): BehaviourBlob.BehaviourData<any, any, any> => BehaviourBlob.generateFrom(spec, all);

const generate = (spec: { behaviours?: AlloyBehaviourRecord }): BehaviourBlob.BehaviourData<any, any, any> => {
  const all = getBehaviours(spec);
  return generateFrom(spec, all);
};

export {
  generate,
  generateFrom
};
