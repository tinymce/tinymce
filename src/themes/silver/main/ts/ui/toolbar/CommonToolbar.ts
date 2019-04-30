/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Focusing, Keying, SplitToolbar as SplitAlloyToolbar, Tabstopping, Toolbar as AlloyToolbar, ToolbarGroup as AlloyToolbarGroup } from '@ephox/alloy';
import { Arr, Option, Result } from '@ephox/katamari';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderIconButtonSpec } from '../general/Button';
import { ToolbarButtonClasses } from './button/ButtonClasses';

export interface MoreDrawerData {
  floating: boolean;
  lazyMoreButton: () => AlloyComponent;
  lazyToolbar: () => AlloyComponent;
}
export interface ToolbarSpec {
  uid: string;
  cyclicKeying: boolean;
  onEscape: (comp: AlloyComponent) => Option<boolean>;
  initGroups: ToolbarGroup[];
  getSink: () => Result<AlloyComponent, string>;
  backstage: UiFactoryBackstage;
  moreDrawerData?: MoreDrawerData;
}

export interface ToolbarGroup {
  title: Option<string>;
  items: AlloySpec[];
}

const renderToolbarGroupCommon = (toolbarGroup: ToolbarGroup) => {
  const attributes = toolbarGroup.title.fold(() => {
    return {};
  },
    (title) => {
      return { attributes: { title } };
    });
  return {
    dom: {
      tag: 'div',
      classes: ['tox-toolbar__group'],
      ...attributes
    },

    components: [
      AlloyToolbarGroup.parts().items({})
    ],

    items: toolbarGroup.items,
    markers: {
      // nav within a group breaks if disabled buttons are first in their group so skip them
      itemSelector: '*:not(.tox-split-button) > .tox-tbtn:not([disabled]), .tox-split-button:not([disabled]), .tox-toolbar-nav-js:not([disabled])'
    },
    tgroupBehaviours: Behaviour.derive([
      Tabstopping.config({}),
      Focusing.config({})
    ])
  };
};

const renderToolbarGroup = (toolbarGroup: ToolbarGroup) => {
  return AlloyToolbarGroup.sketch(renderToolbarGroupCommon(toolbarGroup));
};

const getToolbarbehaviours = (toolbarSpec, modeName) => {
  const onAttached = AlloyEvents.runOnAttached(function (component) {
    const groups = Arr.map(toolbarSpec.initGroups, renderToolbarGroup);
    AlloyToolbar.setGroups(component, groups);
  });

  return Behaviour.derive([
    Keying.config({
      // Tabs between groups
      mode: modeName,
      onEscape: toolbarSpec.onEscape,
      selector: '.tox-toolbar__group'
    }),
    AddEventsBehaviour.config('toolbar-events', [ onAttached ])
  ]);
};

const renderMoreToolbar = (toolbarSpec: ToolbarSpec) => {
  const modeName: any = toolbarSpec.cyclicKeying ? 'cyclic' : 'acyclic';

  const primary = SplitAlloyToolbar.parts().primary({
    dom: {
      tag: 'div',
      classes: ['tox-toolbar__primary']
    }
  });

  return SplitAlloyToolbar.sketch({
    uid: toolbarSpec.uid,
    dom: {
      tag: 'div',
      classes: ['tox-toolbar-overlord']
    },
    lazySink: toolbarSpec.getSink,
    floating: toolbarSpec.moreDrawerData.floating,
    floatingAnchor: () => Option.some(toolbarSpec.backstage.shared.anchors.toolbarOverflow()),
    parts: {
      // This already knows it is a toolbar group
      'overflow-group': renderToolbarGroupCommon({
        title: Option.none(),
        items: []
      }),
      'overflow-button': renderIconButtonSpec({
        name: 'more',
        icon: Option.some('more-drawer'),
        disabled: false,
        tooltip: Option.some('More...')
      }, Option.none(), toolbarSpec.backstage.shared.providers),
      'overflow': {
        dom: {
          tag: 'div',
          classes: ['tox-toolbar__overflow']
        }
      }
    },
    components: [ primary ],
    markers: {
      openClass: 'tox-toolbar__overflow--open',
      closedClass: 'tox-toolbar__overflow--closed',
      growingClass: 'tox-toolbar__overflow--growing',
      shrinkingClass: 'tox-toolbar__overflow--shrinking',
      overflowToggledClass: ToolbarButtonClasses.Ticked
    },
    splitToolbarBehaviours: getToolbarbehaviours(toolbarSpec, modeName)
  });
};

const renderToolbar = (toolbarSpec: ToolbarSpec) => {
  const modeName: any = toolbarSpec.cyclicKeying ? 'cyclic' : 'acyclic';

  return AlloyToolbar.sketch({
    uid: toolbarSpec.uid,
    dom: {
      tag: 'div',
      classes: ['tox-toolbar']
    },
    components: [
      AlloyToolbar.parts().groups({})
    ],

    toolbarBehaviours: getToolbarbehaviours(toolbarSpec, modeName)
  });
};

export { renderToolbarGroup, renderToolbar, renderMoreToolbar };