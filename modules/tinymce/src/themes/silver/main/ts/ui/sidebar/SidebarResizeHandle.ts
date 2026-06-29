import { type AlloySpec, Behaviour, Dragging } from '@ephox/alloy';
import { Optional, Optionals } from '@ephox/katamari';
import { SelectorFind, type SugarElement, Width } from '@ephox/sugar';

import * as SidebarResize from './SidebarResize';

export const makeSidebarResizeHandle = (): AlloySpec => {
  let originalSidebarWidthOpt = Optional.none<number>();
  let sidebarOpt = Optional.none<SugarElement<HTMLElement>>();
  let accumulatedDelta = 0;

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
          SelectorFind.ancestor<HTMLElement>(handle.element, '.tox-sidebar').each((sidebar) => {
            sidebarOpt = Optional.some(sidebar);
            originalSidebarWidthOpt = Optional.some(Width.get(sidebar));
            accumulatedDelta = 0;
          });
        },
        onDrag: (_handle, _target, delta) => {
          Optionals.lift2(sidebarOpt, originalSidebarWidthOpt, (sidebar, originalSidebarWidth) => {
            accumulatedDelta += delta.left;
            SidebarResize.resize(sidebar, originalSidebarWidth, accumulatedDelta);
          });
        }
      })
    ])
  };
};
