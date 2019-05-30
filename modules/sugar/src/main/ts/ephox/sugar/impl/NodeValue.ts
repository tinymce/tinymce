import { PlatformDetection } from '@ephox/sand';
import { Option } from '@ephox/katamari';
import Element from '../api/node/Element';
import { Node } from '@ephox/dom-globals';

export default function (is: (e: Element) => boolean, name: string) {
  const get = function (element: Element) {
    if (!is(element)) { throw new Error('Can only get ' + name + ' value of a ' + name + ' node'); }
    return getOption(element).getOr('');
  };

  const getOptionIE10 = function (element: Element) {
    // Prevent IE10 from throwing exception when setting parent innerHTML clobbers (TBIO-451).
    try {
      return getOptionSafe(element);
    } catch (e) {
      return Option.none<string>();
    }
  };

  const getOptionSafe = function (element: Element) {
    return is(element) ? Option.from((element.dom() as Node).nodeValue) : Option.none<string>();
  };

  const browser = PlatformDetection.detect().browser;
  const getOption = browser.isIE() && browser.version.major === 10 ? getOptionIE10 : getOptionSafe;

  const set = function (element: Element, value: string) {
    if (!is(element)) { throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node'); }
    (element.dom() as Node).nodeValue = value;
  };

  return {
    get,
    getOption,
    set,
  };
}