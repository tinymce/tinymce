import { Objects } from '@ephox/boulder';
import { Merger, Option } from '@ephox/katamari';

import * as Tagger from '../../registry/Tagger';

const record = function (spec) {
  const uid = Objects.hasKey(spec, 'uid') ? spec.uid : Tagger.generate('memento');

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