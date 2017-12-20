import Node from './Node';
import NodeValue from '../../impl/NodeValue';

var api = NodeValue(Node.isComment, 'comment');

var get = function (element) {
  return api.get(element);
};

var getOption = function (element) {
  return api.getOption(element);
};

var set = function (element, value) {
  api.set(element, value);
};

export default <any> {
  get: get,
  getOption: getOption,
  set: set
};