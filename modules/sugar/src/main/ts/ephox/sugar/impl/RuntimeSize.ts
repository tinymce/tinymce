import { Strings } from '@ephox/katamari';

import { SugarElement } from '../api/node/SugarElement';
import * as Css from '../api/properties/Css';

const toNumber = (px: string, fallback: number): number =>
  Strings.toFloat(px).getOr(fallback);

const getProp = (element: SugarElement<HTMLElement>, name: string, fallback: number): number =>
  toNumber(Css.get(element, name), fallback);

const calcContentBoxSize = (element: SugarElement<HTMLElement>, size: number, upper: 'top' | 'left', lower: 'bottom' | 'right') => {
  const paddingUpper = getProp(element, `padding-${upper}`, 0);
  const paddingLower = getProp(element, `padding-${lower}`, 0);
  const borderUpper = getProp(element, `border-${upper}-width`, 0);
  const borderLower = getProp(element, `border-${lower}-width`, 0);

  return size - paddingUpper - paddingLower - borderUpper - borderLower;
};

const getCalculatedHeight = (element: SugarElement<HTMLElement>, boxSizing: string): number => {
  const dom = element.dom;
  const height = dom.getBoundingClientRect().height || dom.offsetHeight;
  return boxSizing === 'border-box' ? height : calcContentBoxSize(element, height, 'top', 'bottom');
};

const getCalculatedWidth = (element: SugarElement<HTMLElement>, boxSizing: string): number => {
  const dom = element.dom;
  const width = dom.getBoundingClientRect().width || dom.offsetWidth;
  return boxSizing === 'border-box' ? width : calcContentBoxSize(element, width, 'left', 'right');
};

const getHeight = (element: SugarElement<HTMLElement>): number =>
  getProp(element, 'height', element.dom.offsetHeight);

const getWidth = (element: SugarElement<HTMLElement>): number =>
  getProp(element, 'width', element.dom.offsetWidth);

const getInnerHeight = (element: SugarElement<HTMLElement>): number =>
  getCalculatedHeight(element, 'content-box');

const getInnerWidth = (element: SugarElement<HTMLElement>): number =>
  getCalculatedWidth(element, 'content-box');

export {
  getInnerHeight,
  getInnerWidth,
  getHeight,
  getWidth
};
