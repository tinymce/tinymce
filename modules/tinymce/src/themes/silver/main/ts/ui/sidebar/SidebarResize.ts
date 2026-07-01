import { Css, type SugarElement } from '@ephox/sugar';

import { numToPx } from '../sizing/Utils';

export const requestedWidthProperty = '--tox-private-requested-sidebar-width';

export const applyWidth = (sidebar: SugarElement<HTMLElement>, width: number): void => {
  Css.set(sidebar, requestedWidthProperty, numToPx(width));
};
