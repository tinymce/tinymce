import { Option } from '@ephox/katamari';
import * as Css from './Css';
import * as Style from '../../impl/Style';
import { HTMLElement } from '@ephox/dom-globals';
import Element from '../node/Element';

var isCentered = function (element: Element) {
  var dom: HTMLElement = element.dom();
  if (Style.isSupported(dom)) {
    var marginLeft = dom.style.marginRight;
    var marginRight = dom.style.marginLeft;
    return marginLeft === 'auto' && marginRight === 'auto';
  } else {
    return false;
  }
};

var divine = function (element: Element) {
  if (isCentered(element)) return Option.some('center');
  else {
    var val = Css.getRaw(element, 'float').getOrThunk(function () {
      return Css.get(element, 'float');
    });
    return val !== undefined && val !== null && val.length > 0 ? Option.some(val) : Option.none<string>();
  }
};

var getRaw = function (element: Element) {
  return Css.getRaw(element, 'float').getOr(null);
};

var setCentered = function (element: Element) {
  Css.setAll(element, {
    'margin-left': 'auto',
    'margin-right': 'auto'
  });
};

export {
  isCentered,
  divine,
  getRaw,
  setCentered,
};