import { Optional } from '@ephox/katamari';

import * as Style from '../../impl/Style';
import { SugarElement } from '../node/SugarElement';
import * as Css from './Css';

const isCentered = (element: SugarElement<Node>): boolean => {
  const dom = element.dom;
  if (Style.isSupported(dom)) {
    const marginLeft = dom.style.marginRight;
    const marginRight = dom.style.marginLeft;
    return marginLeft === 'auto' && marginRight === 'auto';
  } else {
    return false;
  }
};

const divine = (element: SugarElement<Element>): Optional<string> => {
  if (isCentered(element)) {
    return Optional.some('center');
  } else {
    const val = Css.getRaw(element, 'float').getOrThunk(() => Css.get(element, 'float'));
    return val !== undefined && val !== null && val.length > 0 ? Optional.some(val) : Optional.none<string>();
  }
};

const getRaw = (element: SugarElement<Node>): string | null =>
  Css.getRaw(element, 'float').getOrNull();

const setCentered = (element: SugarElement<Node>): void => {
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
