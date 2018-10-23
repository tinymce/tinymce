import * as Node from './Node';
import NodeValue from '../../impl/NodeValue';
import Element from './Element';
import { Option } from '@ephox/katamari';

var api = NodeValue(Node.isText, 'text');

var get = function (element: Element) {
  return api.get(element);
};

var getOption = function (element: Element): Option<string> {
  return api.getOption(element);
};

var set = function (element: Element, value: string) {
  api.set(element, value);
};

export {
  get,
  getOption,
  set,
};