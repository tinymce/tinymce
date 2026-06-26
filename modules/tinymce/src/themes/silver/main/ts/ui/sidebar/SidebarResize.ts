import { Css, type SugarElement, Width } from '@ephox/sugar';

import { numToPx } from '../sizing/Utils';

// The CSS custom property that records the user's requested sidebar width.
export const requestedWidthProperty = '--tox-private-requested-sidebar-width';

// Applies a horizontal drag delta to the sidebar, records the requested width as a
// CSS custom property on the sidebar element, and returns the new width in pixels.
export const resize = (sidebar: SugarElement<HTMLElement>, delta: number): number => {
  // The sidebar is right-aligned with the handle on its left edge, so dragging left
  // (a negative delta) widens it.
  const newWidth = Width.get(sidebar) - delta;
  Css.set(sidebar, requestedWidthProperty, numToPx(newWidth));
  return newWidth;
};
