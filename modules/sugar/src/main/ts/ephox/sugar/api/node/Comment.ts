import * as Node from './Node';
import NodeValue from '../../impl/NodeValue';
import Element from './Element';
import { Option } from '@ephox/katamari';

const api = NodeValue(Node.isComment, 'comment');

const get = function (element: Element) {
  return api.get(element);
};

const getOption = function (element: Element): Option<string> {
  return api.getOption(element);
};

const set = function (element: Element, value: string) {
  api.set(element, value);
};

export {
  get,
  getOption,
  set,
};