import { AddEventsBehaviour, type AlloyComponent, AlloyEvents, Behaviour, Dragging, Focusing, Keying, type SimpleSpec, SystemEvents, Tabstopping } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Attribute, SugarPosition } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';

import * as SidebarResize from './SidebarResize';

const setAriaValuetext = (comp: AlloyComponent, dimensions: SidebarResize.HorizontalDimensions) => {
  Attribute.set(comp.element, 'aria-valuetext', `Sidebar's width: ${dimensions.width} pixels`);
};

const keyboardHandler = (editor: Editor, sidebar: AlloyComponent, comp: AlloyComponent, x: number, y: number): Optional<boolean> => {
  const scale = 10;
  const delta = SugarPosition(x * scale, y * scale);

  const newDimentions = SidebarResize.resize(sidebar, delta, Options.getSidebarMinWidth(editor), Options.getSidebarMaxWidth(editor));
  setAriaValuetext(comp, newDimentions);

  return Optional.some(true);
};

export const makeSidebarResizeHandler = (editor: Editor, sidebarOpt: Optional<AlloyComponent>): Optional<SimpleSpec> => {

  return sidebarOpt.map( (sidebar) => {
    return {
      dom: {
        tag: 'div',
        classes: [ 'tox-sidebar__resize-handle' ],
        attributes: {
          'aria-label': 'Press the Left and Right arrow keys to resize the sidebar.',
          'data-mce-name': 'resize-handle',
          'role': 'separator',
          'style': 'cursor: ew-resize'
        },
      },
      behaviours: Behaviour.derive([
        Dragging.config({
          mode: 'pointer',
          repositionTarget: false,
          onDrag: (comp, _target, delta) => {
            const newDimentions = SidebarResize.resize(sidebar, delta, Options.getSidebarMinWidth(editor), Options.getSidebarMaxWidth(editor));
            setAriaValuetext(comp, newDimentions);
          }
        }),
        Keying.config({
          mode: 'special',
          onLeft: (comp) => keyboardHandler(editor, sidebar, comp, -1, 0),
          onRight: (comp) => keyboardHandler(editor, sidebar, comp, 1, 0),
        }),
        Tabstopping.config({}),
        Focusing.config({}),
        AddEventsBehaviour.config('set-aria-valuetext', [
          AlloyEvents.runOnAttached((comp) => {
            setAriaValuetext(comp, SidebarResize.getOriginalDimensions(sidebar.element));
          })
        ])
      ]),
      eventOrder: {
        [SystemEvents.attachedToDom()]: [ 'add-focusable', 'set-aria-valuetext' ]
      }
    };
  });
};
