import { Comment, Node as DomNode } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import NodeValue from '../../impl/NodeValue';
import Element from './Element';
import * as Node from './Node';

const api = NodeValue(Node.isComment, 'comment');

const get = (element: Element<Comment>) => api.get(element);

const getOption = (element: Element<DomNode>): Option<string> => api.getOption(element);

const set = (element: Element<Comment>, value: string) => api.set(element, value);

export {
  get,
  getOption,
  set
};
