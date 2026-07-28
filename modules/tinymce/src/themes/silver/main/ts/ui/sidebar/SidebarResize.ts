import type { Optional } from '@ephox/katamari';
import { Css, type SugarElement } from '@ephox/sugar';

import { numToPx, parseToInt } from '../sizing/Utils';

export const requestedWidthProperty = '--tox-private-requested-sidebar-width';
export const resolvedWidthProperty = '--tox-private-resolved-sidebar-width';
export const minEditingAreaWidthProperty = '--tox-private-min-editing-area-width';

export const applyWidth = (sidebar: SugarElement<HTMLElement>, width: number): void => {
  Css.set(sidebar, requestedWidthProperty, numToPx(width));
};

export const getMinEditingAreaWidth = (sidebar: SugarElement<HTMLElement>): Optional<number> =>
  parseToInt(Css.get(sidebar, minEditingAreaWidthProperty));
