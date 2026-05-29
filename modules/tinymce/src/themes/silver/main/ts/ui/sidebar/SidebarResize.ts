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

export const getDimensions = (deltas: SugarPosition, originalDimentions: HorizontalDimensions, min: number, max: number): HorizontalDimensions => {
  // Safety net, min sidebar width cannot be send to less than 100
  const MIN_SIDEBAR_CONSTRAINT = 280;
  if (min < MIN_SIDEBAR_CONSTRAINT) {
    min = MIN_SIDEBAR_CONSTRAINT;
  }
  const dimensions = {
    width:
      Utils.calcCappedSize(
        originalDimentions.width - deltas.left,
        Optional.from(min),
        Optional.from(max)
      )
  };

  return dimensions;
};

export const resize = (sidebar: AlloyComponent, deltas: SugarPosition, min: number, max: number): HorizontalDimensions => {

  const originalDimentions = getOriginalDimensions(sidebar.element);
  const dimensions = getDimensions(deltas, originalDimentions, min, max);

  Css.set(sidebar.element, '--tox-private-sidebar-width', Utils.numToPx(dimensions.width));

  return dimensions;
};
