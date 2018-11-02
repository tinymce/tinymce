import {
  AddEventsBehaviour,
  AlloyComponent,
  AlloyEvents,
  AlloySpec,
  Behaviour,
  Keying,
  Tabstopping,
  Toolbar as AlloyToolbar,
  ToolbarGroup as AlloyToolbarGroup,
  Focusing,
} from '@ephox/alloy';
import { Arr, Option } from '@ephox/katamari';

export interface ToolbarFoo {
  uid: string;
  onEscape: (comp: AlloyComponent) => Option<boolean>;
  initGroups: ToolbarGroupFoo[];
}

export interface ToolbarGroupFoo {
  items: AlloySpec[];
}

const renderToolbarGroup = (foo: ToolbarGroupFoo) => {
  return AlloyToolbarGroup.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar__group' ]
    },
    components: [
      AlloyToolbarGroup.parts().items({})
    ],
    items: foo.items,
    markers: {
      // nav within a group breaks if disabled buttons are first in their group so skip them
      itemSelector: '.tox-tbtn:not([disabled]), .tox-split-button:not([disabled]), .tox-toolbar-nav-js:not([disabled])'
    },

    tgroupBehaviours: Behaviour.derive([
      Tabstopping.config({ }),
      Focusing.config({ })
    ])
  });
};

const renderToolbar = (foo: ToolbarFoo) => {
  return AlloyToolbar.sketch({
    uid: foo.uid,
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar' ]
    },
    components: [
      AlloyToolbar.parts().groups({ })
    ],

    toolbarBehaviours: Behaviour.derive([
      Keying.config({
        // Tabs between groups
        mode: 'acyclic',
        onEscape: foo.onEscape,
        selector: '.tox-toolbar__group'
      }),
      AddEventsBehaviour.config('toolbar-events', [
        AlloyEvents.runOnAttached(function (component) {
          const groups = Arr.map(foo.initGroups, renderToolbarGroup);
          AlloyToolbar.setGroups(component, groups);
        })
      ])
    ])
  });
};

export {
  renderToolbarGroup,
  renderToolbar
};