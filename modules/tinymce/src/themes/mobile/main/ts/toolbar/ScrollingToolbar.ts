/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Container, GuiFactory, Keying, Toggling, Toolbar, ToolbarGroup
} from '@ephox/alloy';
import { Arr, Cell, Fun } from '@ephox/katamari';
import { Css } from '@ephox/sugar';

import * as Scrollables from '../ios/scroll/Scrollables';
import * as Styles from '../style/Styles';
import * as Scrollable from '../touch/scroll/Scrollable';
import * as UiDomFactory from '../util/UiDomFactory';

export interface ScrollingToolbar {
  readonly wrapper: AlloyComponent;
  readonly toolbar: AlloyComponent;
  readonly createGroups: (gs) => void;
  readonly setGroups: (gs) => void;
  readonly setContextToolbar: (gs) => void;
  readonly restoreToolbar: () => void;
  readonly refresh: () => void;
  readonly focus: () => void;
}

export const ScrollingToolbar = (): ScrollingToolbar => {
  const makeGroup = (gSpec) => {
    const scrollClass = gSpec.scrollable === true ? '${prefix}-toolbar-scrollable-group' : '';
    return {
      dom: UiDomFactory.dom('<div aria-label="' + gSpec.label + '" class="${prefix}-toolbar-group ' + scrollClass + '"></div>'),

      tgroupBehaviours: Behaviour.derive([
        AddEventsBehaviour.config('adhoc-scrollable-toolbar', gSpec.scrollable === true ? [
          AlloyEvents.runOnInit((component, _simulatedEvent) => {
            Css.set(component.element, 'overflow-x', 'auto');
            Scrollables.markAsHorizontal(component.element);
            Scrollable.register(component.element);
          })
        ] : [ ])
      ]),

      components: [
        Container.sketch({
          components: [
            ToolbarGroup.parts.items({ })
          ]
        })
      ],
      markers: {
        // TODO: Now that alloy isn't marking the items with the old
        // itemClass here, this navigation probably doesn't work. But
        // it's mobile. However, bluetooth keyboards will need to be fixed
        // Essentially, all items put in the toolbar will need to be given
        // this class if they are to be part of keyboard navigation
        itemSelector: '.' + Styles.resolve('toolbar-group-item')
      },

      items: gSpec.items
    };
  };

  const toolbar = GuiFactory.build(
    Toolbar.sketch(
      {
        dom: UiDomFactory.dom('<div class="${prefix}-toolbar"></div>'),
        components: [
          Toolbar.parts.groups({ })
        ],
        toolbarBehaviours: Behaviour.derive([
          Toggling.config({
            toggleClass: Styles.resolve('context-toolbar'),
            toggleOnExecute: false,
            aria: {
              mode: 'none'
            }
          }),
          Keying.config({
            mode: 'cyclic'
          })
        ]),
        shell: true
      }
    )
  );

  const wrapper = GuiFactory.build(
    Container.sketch({
      dom: {
        classes: [ Styles.resolve('toolstrip') ]
      },
      components: [
        GuiFactory.premade(toolbar)
      ],
      containerBehaviours: Behaviour.derive([
        Toggling.config({
          toggleClass: Styles.resolve('android-selection-context-toolbar'),
          toggleOnExecute: false
        })
      ])
    })
  );

  const resetGroups = () => {
    Toolbar.setGroups(toolbar, initGroups.get());
    Toggling.off(toolbar);
  };

  const initGroups = Cell([ ]);

  const setGroups = (gs) => {
    initGroups.set(gs);
    resetGroups();
  };

  const createGroups = (gs) => {
    return Arr.map(gs, Fun.compose(ToolbarGroup.sketch, makeGroup));
  };

  // eslint-disable-next-line @tinymce/prefer-fun
  const refresh = () => {
    // Toolbar.refresh is undefined
    // Toolbar.refresh(toolbar);
  };

  const setContextToolbar = (gs) => {
    Toggling.on(toolbar);
    Toolbar.setGroups(toolbar, gs);
  };

  const restoreToolbar = () => {
    if (Toggling.isOn(toolbar)) {
      resetGroups();
    }
  };

  const focus = () => {
    Keying.focusIn(toolbar);
  };

  return {
    wrapper,
    toolbar,
    createGroups,
    setGroups,
    setContextToolbar,
    restoreToolbar,
    refresh,
    focus
  };
};
