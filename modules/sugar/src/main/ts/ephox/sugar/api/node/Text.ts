import * as Node from './Node';
import NodeValue from '../../impl/NodeValue';
import Element from './Element';
import { Option } from '@ephox/katamari';
import { Text, Node as DomNode } from '@ephox/dom-globals';

const api = NodeValue(Node.isText, 'text');

const get = function (element: Element<Text>) {
  return api.get(element);
};

const getOption = function (element: Element<DomNode>): Option<string> {
  return api.getOption(element);
};

const set = function (element: Element<Text>, value: string) {
  api.set(element, value);
};

export {
  get,
  getOption,
  set,
};