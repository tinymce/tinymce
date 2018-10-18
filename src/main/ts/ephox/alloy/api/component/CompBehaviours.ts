import { Objects } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';

import * as BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import { AlloyBehaviour, AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';

export interface ComponentBehaviour {
  data: {
    key: string;
    value: () => AlloyBehaviour<any, any>;
  };
  list: Array<AlloyBehaviour<any, any>>;
}

type BehaviourName = string;

// This goes through the list of behaviours defined for a particular spec (removing anyhing
// that has been revoked), and returns the BehaviourType (e.g. Sliding)
const getBehaviours = (spec): Array<AlloyBehaviour<any, any>> => {
  const behaviours: AlloyBehaviourRecord = Objects.readOptFrom<any>(spec, 'behaviours').getOr({ });
  const keys = Arr.filter(
    Obj.keys(behaviours),
    (k: BehaviourName) => behaviours[k] !== undefined
  );
  return Arr.map(keys, (k) => {
    return behaviours[k].me;
  });
};

const generateFrom = (spec: SimpleOrSketchSpec, all: Array<AlloyBehaviour<any, any>>): BehaviourBlob.BehaviourData => {
  return BehaviourBlob.generateFrom(spec, all);
};

const generate = (spec: SimpleOrSketchSpec): BehaviourBlob.BehaviourData => {
  const all = getBehaviours(spec);
  return generateFrom(spec, all);
};

export {
  generate,
  generateFrom
};