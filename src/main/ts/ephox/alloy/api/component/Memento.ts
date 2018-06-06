import { Objects } from '@ephox/boulder';
import { Merger, Option } from '@ephox/katamari';
import { SimpleOrSketchSpec } from 'ephox/alloy/api/component/SpecTypes';

import { isSketchSpec } from '../../api/ui/Sketcher';
import * as Tagger from '../../registry/Tagger';

export interface MomentoRecord {
  get: () => any;
  getOpt: () => any;
  asSpec: () => any;
}

const record = function (spec: SimpleOrSketchSpec) {
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