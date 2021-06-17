import { Optional } from '@ephox/katamari';

import { NodeValue } from '../../impl/NodeValue';
import { SugarElement } from './SugarElement';
import * as SugarNode from './SugarNode';

const api = NodeValue(SugarNode.isText, 'text');

const get = (element: SugarElement<Text>): string =>
  api.get(element);

const getOption = (element: SugarElement<Node>): Optional<string> =>
  api.getOption(element);

const set = (element: SugarElement<Text>, value: string): void =>
  api.set(element, value);

export {
  get,
  getOption,
  set
};
