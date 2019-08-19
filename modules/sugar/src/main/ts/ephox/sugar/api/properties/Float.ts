import { Option } from '@ephox/katamari';
import * as Css from './Css';
import * as Style from '../../impl/Style';
import { Node as DomNode, Element as DomElement } from '@ephox/dom-globals';
import Element from '../node/Element';

const isCentered = function (element: Element<DomNode>) {
  const dom = element.dom();
  if (Style.isSupported(dom)) {
    const marginLeft = dom.style.marginRight;
    const marginRight = dom.style.marginLeft;
    return marginLeft === 'auto' && marginRight === 'auto';
  } else {
    return false;
  }
};

const divine = function (element: Element<DomElement>) {
  if (isCentered(element)) {
    return Option.some('center');
  } else {
    const val = Css.getRaw(element, 'float').getOrThunk(function () {
      return Css.get(element, 'float');
    });
    return val !== undefined && val !== null && val.length > 0 ? Option.some(val) : Option.none<string>();
  }
};

const getRaw = function (element: Element<DomNode>) {
  return Css.getRaw(element, 'float').getOrNull();
};

const setCentered = function (element: Element<DomNode>) {
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