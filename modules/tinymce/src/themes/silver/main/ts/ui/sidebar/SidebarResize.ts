import { Css, type SugarElement } from '@ephox/sugar';

import { numToPx } from '../sizing/Utils';

export const requestedWidthProperty = '--tox-private-requested-sidebar-width';

export const minWidth = 200;
export const maxWidth = 600;

export const initialWidth = 300;

export const applyWidth = (sidebar: SugarElement<HTMLElement>, width: number): void => {
  Css.set(sidebar, requestedWidthProperty, numToPx(width));
};
