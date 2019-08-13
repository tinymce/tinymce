import { Option } from '@ephox/katamari';
import Element from '../api/node/Element';
import { Node } from '@ephox/dom-globals';

export default function (is: (e: Element<Node>) => boolean, name: string) {
  const get = function (element: Element): string {
    if (!is(element)) {
      throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
    }
    return getOption(element).getOr('');
  };

  const getOption = function (element: Element<Node>): Option<string> {
    return is(element) ? Option.from(element.dom().nodeValue) : Option.none<string>();
  };

  const set = function (element: Element<Node>, value: string): void {
    if (!is(element)) {
      throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
    }
    element.dom().nodeValue = value;
  };

  return {
    get,
    getOption,
    set,
  };
}
