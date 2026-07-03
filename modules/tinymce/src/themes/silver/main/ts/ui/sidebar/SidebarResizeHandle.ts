import { type AlloyComponent, type AlloySpec, Behaviour, Dragging, Resizing } from '@ephox/alloy';
import type { Optional } from '@ephox/katamari';
import { Height, SelectorFind, type SugarElement, SugarPosition, Width } from '@ephox/sugar';

import type { SidebarSizeConstraints } from './Sidebar';
import * as SidebarResize from './SidebarResize';

const findSidebar = (handle: AlloyComponent): Optional<SugarElement<HTMLElement>> =>
  SelectorFind.ancestor<HTMLElement>(handle.element, '.tox-sidebar');

const findSidebarWrap = (handle: AlloyComponent): Optional<SugarElement<HTMLElement>> =>
  SelectorFind.ancestor<HTMLElement>(handle.element, '.tox-sidebar-wrap');

export const makeSidebarResizeHandle = (sizeConstraints: SidebarSizeConstraints): AlloySpec => {
  const { minWidth, maxWidth } = sizeConstraints;

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-sidebar__resize-handle' ]
    },
    behaviours: Behaviour.derive([
      Dragging.config({
        mode: 'pointer',
        repositionTarget: false,
        onDragStart: (handle) => {
          findSidebar(handle).each((sidebar) => {
            const sidebarWidth = Width.get(sidebar);
            const availableMax = findSidebarWrap(handle)
              .map((wrap) => Math.floor(Width.get(wrap)) - SidebarResize.minEditingAreaWidth)
              .getOr(maxWidth);
            const effectiveMax = Math.min(maxWidth, availableMax);
            if (sidebarWidth >= minWidth) {
              Resizing.start(handle, Width.get(sidebar), Height.get(sidebar), { minWidth, maxWidth: effectiveMax });
            }
          });
        },
        onDrag: (handle, _target, delta) => {
          // The handle sits on the sidebar's left edge, so dragging left should grow it: invert the horizontal delta.
          Resizing.moveBy(handle, SugarPosition(delta.left * -1, 0)).each(({ width }) => {
            findSidebar(handle).each((sidebar) => SidebarResize.applyWidth(sidebar, width));
          });
        },
        onDrop: (handle) => {
          Resizing.stop(handle);
        }
      }),
      Resizing.config({})
    ])
  };
};
