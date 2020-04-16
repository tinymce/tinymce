import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import * as Style from '../../impl/Style';
import Element from '../node/Element';
import * as Css from './Css';

const isCentered = (element: Element<DomNode>) => {
  const dom = element.dom();
  if (Style.isSupported(dom)) {
    const marginLeft = dom.style.marginRight;
    const marginRight = dom.style.marginLeft;
    return marginLeft === 'auto' && marginRight === 'auto';
  } else {
    return false;
  }
};

const divine = (element: Element<DomElement>) => {
  if (isCentered(element)) {
    return Option.some('center');
  } else {
    const val = Css.getRaw(element, 'float').getOrThunk(() => Css.get(element, 'float'));
    return val !== undefined && val !== null && val.length > 0 ? Option.some(val) : Option.none<string>();
  }
};

const getRaw = (element: Element<DomNode>) => Css.getRaw(element, 'float').getOrNull();

const setCentered = (element: Element<DomNode>) => {
  Css.setAll(element, {
    'margin-left': 'auto',
    'margin-right': 'auto'
  });
};

export {
  isCentered,
  divine,
  getRaw,
  setCentered
};
