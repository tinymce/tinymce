import { type AlloySpec, Behaviour, Dragging } from '@ephox/alloy';
import { SelectorFind } from '@ephox/sugar';

import * as SidebarResize from './SidebarResize';

export const makeSidebarResizeHandle = (): AlloySpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-sidebar__resize-handle' ]
    },
    behaviours: Behaviour.derive([
      Dragging.config({
        mode: 'pointer',
        repositionTarget: false,
        onDrag: (handle, _target, delta) =>
          // TODO: this has to change as we're calculating real width of the sidebar on each drag
          // and it is expensive
          SelectorFind.ancestor<HTMLElement>(handle.element, '.tox-sidebar').each((sidebar) => {
            SidebarResize.resize(sidebar, delta.left);
          })
      })
    ])
  };
};
