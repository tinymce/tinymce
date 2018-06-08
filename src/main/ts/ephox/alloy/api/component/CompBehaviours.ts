import { Objects } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';

import BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import { AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { AlloySpec, SimpleOrSketchSpec } from '../../api/component/SpecTypes';

export interface ComponentBehaviour {
  data: {
    key: string;
    value: () => AlloyBehaviour;
  };
  list: AlloyBehaviour[];
}

const getBehaviours = function (spec) {
  const behaviours = Objects.readOptFrom(spec, 'behaviours').getOr({ });
  const keys = Arr.filter(
    Obj.keys(behaviours),
    function (k) { return behaviours[k] !== undefined; }
  );
  return Arr.map(keys, function (k) {
    return spec.behaviours[k].me;
  });
};

const generateFrom = function (spec: SimpleOrSketchSpec, all: AlloyBehaviour[]): ComponentBehaviour {
  return BehaviourBlob.generateFrom(spec, all);
};

const generate = function (spec): ComponentBehaviour {
  const all = getBehaviours(spec);
  return generateFrom(spec, all);
};

export {
  generate,
  generateFrom
};