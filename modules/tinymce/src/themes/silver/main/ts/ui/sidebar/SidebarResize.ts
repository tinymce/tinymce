import type { AlloyComponent } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Css, type SugarElement, type SugarPosition, Width } from '@ephox/sugar';

import * as Utils from '../sizing/Utils';

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
        Optional.from(100),
        Optional.from(1000) // should be width of the content?
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
