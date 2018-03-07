import { Objects } from '@ephox/boulder';
import { Merger, Option } from '@ephox/katamari';

import * as Tagger from '../../registry/Tagger';
import { AlloyMixedSpec, isSketchSpec } from 'ephox/alloy/api/ui/Sketcher';

export interface MomentoRecord {
  get: () => any;
  getOpt: () => any;
  asSpec: () => any;
}

const record = function (spec: AlloyMixedSpec) {
  const uid = isSketchSpec(spec) && Objects.hasKey(spec, 'uid') ? spec.uid : Tagger.generate('memento');

  const get = function (any) {
    return any.getSystem().getByUid(uid).getOrDie();
  };

  const getOpt = function (any) {
    return any.getSystem().getByUid(uid).fold(Option.none, Option.some);
  };

  const asSpec = function () {
    return Merger.deepMerge(spec, {
      uid
    });
  };

  return {
    get,
    getOpt,
    asSpec
  };
};

export {
  record
};