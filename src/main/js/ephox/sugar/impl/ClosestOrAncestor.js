import { Type } from '@ephox/katamari';
import { Option } from '@ephox/katamari';



export default <any> function (is, ancestor, scope, a, isRoot) {
  return is(scope, a) ?
          Option.some(scope) :
          Type.isFunction(isRoot) && isRoot(scope) ?
              Option.none() :
              ancestor(scope, a, isRoot);
};