import Tagger from '../../registry/Tagger';
import { Objects } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var record = function (spec) {
  var uid = Objects.hasKey(spec, 'uid') ? spec.uid : Tagger.generate('memento');

  var get = function (any) {
    return any.getSystem().getByUid(uid).getOrDie();
  };

  var getOpt = function (any) {
    return any.getSystem().getByUid(uid).fold(Option.none, Option.some);
  };

  var asSpec = function () {
    return Merger.deepMerge(spec, {
      uid: uid
    });
  };

  return {
    get: get,
    getOpt: getOpt,
    asSpec: asSpec
  };
};

export default <any> {
  record: record
};