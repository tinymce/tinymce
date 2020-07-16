import { Node } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { SugarElement } from '../api/node/SugarElement';

export default (is: (e: SugarElement<Node>) => boolean, name: string) => {
  const get = (element: SugarElement): string => {
    if (!is(element)) {
      throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
    }
    return getOption(element).getOr('');
  };

  const getOption = (element: SugarElement<Node>): Option<string> =>
    is(element) ? Option.from(element.dom().nodeValue) : Option.none<string>();

  const set = (element: SugarElement<Node>, value: string): void => {
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
