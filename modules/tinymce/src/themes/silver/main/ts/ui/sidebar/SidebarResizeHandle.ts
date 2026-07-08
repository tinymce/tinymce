import { type AlloyComponent, type AlloySpec, Behaviour, Dragging, Resizing } from '@ephox/alloy';
import type { Optional } from '@ephox/katamari';
import { Height, SelectorFind, type SugarElement, SugarPosition, Width } from '@ephox/sugar';

import type { EditorEventMap } from 'tinymce/core/api/EventTypes';
import type Observable from 'tinymce/core/api/util/Observable';

import * as Events from '../../api/Events';

import type { SidebarSizeConstraints } from './Sidebar';
import * as SidebarResize from './SidebarResize';

const findSidebar = (handle: AlloyComponent): Optional<SugarElement<HTMLElement>> =>
  SelectorFind.ancestor<HTMLElement>(handle.element, '.tox-sidebar');

const findSidebarWrap = (handle: AlloyComponent): Optional<SugarElement<HTMLElement>> =>
  SelectorFind.ancestor<HTMLElement>(handle.element, '.tox-sidebar-wrap');

export const makeSidebarResizeHandle = (sizeConstraints: SidebarSizeConstraints, eventDispatcher: Observable<EditorEventMap>): AlloySpec => {
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
            // When the editor is too narrow to honour both the sidebar's configured minimum
            // and the editing area's minimum, the range is unsatisfiable. Skip the resize so a
            // drag can't clobber the preserved requested width with the clamped value.
            if (effectiveMax >= minWidth) {
              Resizing.start(handle, sidebarWidth, Height.get(sidebar), { minWidth, maxWidth: effectiveMax });
              Events.fireSidebarResizeStart(eventDispatcher);
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
          Resizing.stop(handle).each(({ width }) => {
            Events.fireSidebarResized(eventDispatcher, width);
          });
        }
      }),
      Resizing.config({})
    ])
  };
};
