import { SugarElement } from '../node/SugarElement';
import * as Attribute from './Attribute';
import * as Css from './Css';

const onDirection = <T = any> (isLtr: T, isRtl: T) => (element: SugarElement<Element>): T =>
  getDirection(element) === 'rtl' ? isRtl : isLtr;

const getDirection = (element: SugarElement<Element>): 'rtl' | 'ltr' | 'auto' => {
  const dirAttr = Attribute.get(element, 'dir');
  if (dirAttr === 'auto') {
    return dirAttr;
  } else {
    return Css.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  }
};

export {
  onDirection,
  getDirection
};
