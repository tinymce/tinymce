import Node from './Node';
import NodeValue from '../../impl/NodeValue';
import Element from './Element';

var api = NodeValue(Node.isComment, 'comment');

var get = function (element: Element) {
  return api.get(element);
};

var getOption = function (element: Element) {
  return api.getOption(element);
};

var set = function (element: Element, value: string) {
  api.set(element, value);
};

export default {
  get,
  getOption,
  set,
};