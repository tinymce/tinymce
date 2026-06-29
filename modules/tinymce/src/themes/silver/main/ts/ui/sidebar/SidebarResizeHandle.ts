import { type AlloyComponent, type AlloySpec, Behaviour, Dragging } from '@ephox/alloy';
import type { Optional } from '@ephox/katamari';
import { Height, SelectorFind, type SugarElement, SugarPosition, Width } from '@ephox/sugar';

import { Resizing } from './Resizing';
import * as SidebarResize from './SidebarResize';

const findSidebar = (handle: AlloyComponent): Optional<SugarElement<HTMLElement>> =>
  SelectorFind.ancestor<HTMLElement>(handle.element, '.tox-sidebar');

export const makeSidebarResizeHandle = (): AlloySpec => ({
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
          Resizing.start(handle, Width.get(sidebar), Height.get(sidebar), {
            minWidth: SidebarResize.minWidth,
            maxWidth: SidebarResize.maxWidth
          });
        });
      },
      onDrag: (handle, _target, delta) => {
        // The handle sits on the sidebar's left edge, so dragging left should grow it: invert the horizontal delta.
        Resizing.drag(handle, SugarPosition(delta.left * -1, 0));
      }
    }),
    Resizing.config({
      resize: (handle, width, _height) => {
        findSidebar(handle).each((sidebar) => {
          SidebarResize.applyWidth(sidebar, width);
        });
      }
    })
  ])
});
