import { Node as DomNode, Text } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import NodeValue from '../../impl/NodeValue';
import Element from './Element';
import * as Node from './Node';

const api = NodeValue(Node.isText, 'text');

const get = (element: Element<Text>) => api.get(element);

const getOption = (element: Element<DomNode>): Option<string> => api.getOption(element);

const set = (element: Element<Text>, value: string) => api.set(element, value);

export {
  get,
  getOption,
  set
};
