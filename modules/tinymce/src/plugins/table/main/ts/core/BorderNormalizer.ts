/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optionals } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';
import { DomModifier } from '../ui/DomModifier';

const getComputedCombinedBorderProperty = (el: SugarElement<HTMLTableCellElement>, property: string) => {
  const getSideValue = (side: string) => {
    const propName = `border-${side}-${property}`;

    // IE doesn't return the right computed style value even if it's explicitly set in the style
    // attribute so we need to first check the raw value since that is the common case anyway
    return Css.getRaw(el, propName).getOr(Css.get(el, propName));
  };

  const values = Arr.map([ 'top', 'left', 'bottom', 'right' ], getSideValue);
  return Optionals.someIf(values[0] !== '' && Arr.forall(values.slice(1), (v) => v === values[0]), values[0]);
};

// IE returns subpixel border values even if the css is set to 1px so lets normalize that to the closest pixel
const parsePxValue = (w: string) => Math.round(parseFloat(w));

const getComputedBorderWidth = (el: SugarElement<HTMLTableCellElement>) => getComputedCombinedBorderProperty(el, 'width').map(parsePxValue).getOr(1);
const getComputedBorderStyle = (el: SugarElement<HTMLTableCellElement>) => getComputedCombinedBorderProperty(el, 'style').getOr('solid');

const setBorderStyle = (modifier: DomModifier, style: string) => modifier.setFormat('tablecellborderstyle', style);
const setBorderWidth = (modifier: DomModifier, width: string) => modifier.setFormat('tablecellborderwidth', width);

const isVisibleBorderStyle = (value: string) => value !== 'none' && value !== 'hidden' && value !== '';
const hasVisibleBorderStyle = (el: SugarElement<HTMLTableCellElement>) => isVisibleBorderStyle(getComputedBorderStyle(el));
const hasBorderColor = (el: SugarElement<HTMLTableCellElement>) => Css.getRaw(el, 'border-color').isSome();
const hasDoubleBorderStyle = (el: SugarElement<HTMLTableCellElement>) => Css.getRaw(el, 'border-style').exists((style) => style === 'double');
const hasOnePxBorderWidth = (el: SugarElement<HTMLTableCellElement>) => getComputedBorderWidth(el) === 1;

export const normalizeSetCellBorderColor = (modifier: DomModifier, cell: SugarElement<HTMLTableCellElement>, value: string) => {
  if (hasOnePxBorderWidth(cell) && hasVisibleBorderStyle(cell)) {
    // We need to set it to unset the border-style when we are clearing the border-color to prevent the border from overlapping to adjacent cells
    setBorderStyle(modifier, value === '' ? '' : 'double');
  }
};

export const normalizeSetCellBorderWidth = (modifier: DomModifier, cell: SugarElement<HTMLTableCellElement>, value: string) => {
  const width = value === '' ? 0 : parseFloat(value);

  if (hasVisibleBorderStyle(cell)) {
    if (width === 1) {
      // We need to set border-style to `double` in order render the border-color
      setBorderStyle(modifier, hasBorderColor(cell) ? 'double' : '');
    } else if (width === 0) {
      setBorderStyle(modifier, '');
    } else if (width > 1 && hasDoubleBorderStyle(cell)) {
      setBorderStyle(modifier, 'solid');
    }
  }
};

export const normalizeSetCellBorderStyle = (modifier: DomModifier, cell: SugarElement<HTMLTableCellElement>, value: string) => {
  if (hasOnePxBorderWidth(cell)) {
    if (value === '') {
      setBorderWidth(modifier, '');
    } else if (value === 'solid') {
      // We need to set the border-width to 2px if the cell has border-color in order to render that color
      if (hasBorderColor(cell)) {
        setBorderWidth(modifier, '2px');
      }
    } else if (isVisibleBorderStyle(value)) {
      // Any visible borders except solid needs a 2px border-width to render
      setBorderWidth(modifier, '2px');
    }
  }
};
