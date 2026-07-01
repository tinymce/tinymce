import { type AlloyComponent, type AlloySpec, Behaviour, Dragging, Resizing } from '@ephox/alloy';
import type { Optional } from '@ephox/katamari';
import { Height, SelectorFind, type SugarElement, SugarPosition, Width } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';

import * as SidebarResize from './SidebarResize';

const findSidebar = (handle: AlloyComponent): Optional<SugarElement<HTMLElement>> =>
  SelectorFind.ancestor<HTMLElement>(handle.element, '.tox-sidebar');

const sizeConstraints = {
  minWidth: SidebarResize.minWidth,
  maxWidth: SidebarResize.maxWidth
};

export const makeSidebarResizeHandle = (editor: Editor): AlloySpec => {
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
            Resizing.start(handle, Width.get(sidebar), Height.get(sidebar), sizeConstraints);
          });
        },
        onDrag: (handle, _target, delta) => {
        // The handle sits on the sidebar's left edge, so dragging left should grow it: invert the horizontal delta.
          Resizing.moveBy(handle, SugarPosition(delta.left * -1, 0));
        }
      }),
      Resizing.config({
        resize: (handle, width) => {
          findSidebar(handle).each((sidebar) => {
            SidebarResize.applyWidth(sidebar, width);
          });
        }
      })
    ])
  };
};
