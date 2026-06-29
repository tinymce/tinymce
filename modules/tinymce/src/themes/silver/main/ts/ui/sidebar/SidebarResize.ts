import { Css, type SugarElement } from '@ephox/sugar';

import { numToPx } from '../sizing/Utils';

// The CSS custom property that records the user's requested sidebar width.
export const requestedWidthProperty = '--tox-private-requested-sidebar-width';

// The bounds (in pixels) that the sidebar width is clamped to while resizing.
export const minWidth = 200;
export const maxWidth = 600;

// The width (in pixels) the sidebar starts at before the user has resized it.
export const initialWidth = 300;

// Records the requested sidebar width as a CSS custom property on the sidebar element.
export const applyWidth = (sidebar: SugarElement<HTMLElement>, width: number): void => {
  Css.set(sidebar, requestedWidthProperty, numToPx(width));
};
