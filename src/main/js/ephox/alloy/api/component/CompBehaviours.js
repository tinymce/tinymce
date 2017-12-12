import BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';

var getBehaviours = function (spec) {
  var behaviours = Objects.readOptFrom(spec, 'behaviours').getOr({ });
  var keys = Arr.filter(
    Obj.keys(behaviours),
    function (k) { return behaviours[k] !== undefined; }
  );
  return Arr.map(keys, function (k) {
    return spec.behaviours[k].me;
  });
};

var generateFrom = function (spec, all) {
  return BehaviourBlob.generateFrom(spec, all);
};

var generate = function (spec) {
  var all = getBehaviours(spec);
  return generateFrom(spec, all);
};

export default <any> {
  generate: generate,
  generateFrom: generateFrom
};