import { Css, type SugarElement } from '@ephox/sugar';

import { numToPx } from '../sizing/Utils';

export const requestedWidthProperty = '--tox-private-requested-sidebar-width';
export const minEditingAreaWidthProperty = '--tox-private-min-editing-area-width';
export const minEditingAreaWidth = 280;

export const resizableClass = 'tox-sidebar-wrap--resizable';

export const applyWidth = (sidebar: SugarElement<HTMLElement>, width: number): void => {
  Css.set(sidebar, requestedWidthProperty, numToPx(width));
};
