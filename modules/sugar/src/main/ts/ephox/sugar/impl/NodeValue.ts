import { Node } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import Element from '../api/node/Element';

export default (is: (e: Element<Node>) => boolean, name: string) => {
  const get = (element: Element): string => {
    if (!is(element)) {
      throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
    }
    return getOption(element).getOr('');
  };

  const getOption = (element: Element<Node>): Option<string> =>
    is(element) ? Option.from(element.dom().nodeValue) : Option.none<string>();

  const set = (element: Element<Node>, value: string): void => {
    if (!is(element)) {
      throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
    }
    element.dom().nodeValue = value;
  };

  return {
    get,
    getOption,
    set
  };
};
