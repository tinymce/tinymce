import { Optional } from '@ephox/katamari';

import { SugarElement } from '../api/node/SugarElement';

export interface NodeValue {
  readonly get: (element: SugarElement<Node>) => string;
  readonly getOption: (element: SugarElement<Node>) => Optional<string>;
  readonly set: (element: SugarElement<Node>, value: string) => void;
}

export const NodeValue = (is: (e: SugarElement<Node>) => boolean, name: string): NodeValue => {
  const get = (element: SugarElement<Node>): string => {
    if (!is(element)) {
      throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
    }
    return getOption(element).getOr('');
  };

  const getOption = (element: SugarElement<Node>): Optional<string> =>
    is(element) ? Optional.from(element.dom.nodeValue) : Optional.none<string>();

  const set = (element: SugarElement<Node>, value: string): void => {
    if (!is(element)) {
      throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
    }
    element.dom.nodeValue = value;
  };

  return {
    get,
    getOption,
    set
  };
};
