import { Objects } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';

import * as BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import { AlloyBehaviour, ConfiguredBehaviour, AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloySpec, SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import { BehaviourData } from '../../behaviour/common/BehaviourBlob';

export interface ComponentBehaviour {
  data: {
    key: string;
    value: () => AlloyBehaviour;
  };
  list: AlloyBehaviour[];
}

type BehaviourName = string;

// This goes through the list of behaviours defined for a particular spec (removing anyhing
// that has been revoked), and returns the BehaviourType (e.g. Sliding)
const getBehaviours = (spec): AlloyBehaviour[] => {
  const behaviours: AlloyBehaviourRecord = Objects.readOptFrom(spec, 'behaviours').getOr({ });
  const keys = Arr.filter(
    Obj.keys(behaviours),
    (k: BehaviourName) => { return behaviours[k] !== undefined; }
  );
  return Arr.map(keys, (k) => {
    return behaviours[k].me;
  });
};

const generateFrom = (spec: SimpleOrSketchSpec, all: AlloyBehaviour[]): BehaviourData => {
  return BehaviourBlob.generateFrom(spec, all);
};

const generate = (spec: SimpleOrSketchSpec): BehaviourData => {
  const all = getBehaviours(spec);
  return generateFrom(spec, all);
};

export {
  generate,
  generateFrom
};