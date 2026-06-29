import { Num } from '@ephox/katamari';
import { Css, type SugarElement } from '@ephox/sugar';

import { numToPx } from '../sizing/Utils';

// The CSS custom property that records the user's requested sidebar width.
export const requestedWidthProperty = '--tox-private-requested-sidebar-width';

// The bounds (in pixels) that the sidebar width is clamped to while resizing.
export const minWidth = 200;
export const maxWidth = 600;

// The width (in pixels) the sidebar starts at before the user has resized it.
export const initialWidth = 300;

// Applies a horizontal drag delta to the sidebar, records the requested width as a
// CSS custom property on the sidebar element, and returns the new width in pixels.
export const resize = (sidebar: SugarElement<HTMLElement>, originalWidth: number, delta: number): number => {
  const newWidth = Num.clamp(originalWidth - delta, minWidth, maxWidth);
  Css.set(sidebar, requestedWidthProperty, numToPx(newWidth));
  return newWidth;
};
