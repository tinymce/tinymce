import type { AlloyComponent } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Attribute, Css, type SugarElement, type SugarPosition, Width } from '@ephox/sugar';

import * as Utils from '../sizing/Utils';

const RESIZE_MIN = 300;
const RESIZE_MAX = 750;

export interface HorizontalDimensions {
  readonly width: number;
}

export const getOriginalDimensions = (sidebar: SugarElement<HTMLElement>): HorizontalDimensions => {
  const originalWidth: number = Width.get(sidebar);
  return {
    width: originalWidth,
  };
};

export const getDimensions = (deltas: SugarPosition, originalDimentions: HorizontalDimensions): HorizontalDimensions => {
  const dimensions = {
    width:
      Utils.calcCappedSize(
        originalDimentions.width - deltas.left,
        Optional.from(RESIZE_MIN),
        Optional.from(RESIZE_MAX) // should be width of the content?
      )
  };

  return dimensions;
};

export const resize = (sidebar: AlloyComponent, deltas: SugarPosition): HorizontalDimensions => {

  const originalDimentions = getOriginalDimensions(sidebar.element);
  const dimensions = getDimensions( deltas, originalDimentions);

  Css.set(sidebar.element, '--tox-private-sidebar-width', Utils.numToPx(dimensions.width));

  return dimensions;
};
