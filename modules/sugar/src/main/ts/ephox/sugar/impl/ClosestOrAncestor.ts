import { Option, Type } from '@ephox/katamari';
import Element from '../api/node/Element';

export default function (is, ancestor, scope: Element, a, isRoot): Option<Element> {
  return is(scope, a) ?
          Option.some(scope) :
          Type.isFunction(isRoot) && isRoot(scope) ?
              Option.none() :
              ancestor(scope, a, isRoot);
}