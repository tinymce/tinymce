/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Attachment, Behaviour, Focusing, GuiFactory, Keying, Memento, Positioning, SplitToolbar as SplitAlloyToolbar, Tabstopping, Toolbar as AlloyToolbar, ToolbarGroup as AlloyToolbarGroup } from '@ephox/alloy';
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

const getToolbarbehaviours = (toolbarSpec, modeName, overflowOpt) => {
  const onAttached = AlloyEvents.runOnAttached(function (component) {
    const groups = Arr.map(toolbarSpec.initGroups, renderToolbarGroup);
    AlloyToolbar.setGroups(component, groups);
  });

  const eventBehaviours = overflowOpt.fold(() => [
    onAttached
  ],
    (memOverflow) => [
      onAttached,
      AlloyEvents.run('alloy.toolbar.toggle', (toolbar, se) => {
        toolbarSpec.getSink().toOption().each((sink) => {
          memOverflow.getOpt(sink).fold(() => {
            // overflow isn't there yet ... so add it, and return the built thing
            const builtoverFlow = GuiFactory.build(memOverflow.asSpec());
            Attachment.attach(sink, builtoverFlow);
            Positioning.position(sink, toolbarSpec.backstage.shared.anchors.toolbarOverflow(), builtoverFlow);
            SplitAlloyToolbar.refresh(toolbar);
            SplitAlloyToolbar.getMoreButton(toolbar).each(Focusing.focus);
            Keying.focusIn(builtoverFlow);
            // return builtoverFlow;
          }, (builtOverflow) => {
            Attachment.detach(builtOverflow);
          });
        });
      })
    ]
  );
  return Behaviour.derive([
    Keying.config({
      // Tabs between groups
      mode: modeName,
      onEscape: toolbarSpec.onEscape,
      selector: '.tox-toolbar__group'
    }),
    AddEventsBehaviour.config('toolbar-events', eventBehaviours)
  ]);
};

const renderMoreToolbar = (toolbarSpec: ToolbarSpec) => {
  const modeName: any = toolbarSpec.cyclicKeying ? 'cyclic' : 'acyclic';

  const memOverflow = Memento.record(
    AlloyToolbar.sketch({
      dom: {
        tag: 'div',
        classes: ['tox-toolbar__overflow']
      },
      toolbarBehaviours: Behaviour.derive([
        Keying.config({
        // THIS IS USED FOR FLOATING AND NOT SLIDING
        mode: 'cyclic',
          onEscape: () => {
            AlloyTriggers.emit(toolbarSpec.moreDrawerData.lazyToolbar(), 'alloy.toolbar.toggle');
            Keying.focusIn(toolbarSpec.moreDrawerData.lazyMoreButton());
            return Option.some(true);
          }
        })
      ])
    })
  );

  const getOverflow = (toolbar) => {
    return toolbarSpec.getSink().toOption().bind((sink) => {
      return memOverflow.getOpt(sink).bind(
        (overflow) => {
          return SplitAlloyToolbar.getMoreButton(toolbar).bind((_moreButton) => {
            if (overflow.getSystem().isConnected()) {
              // you have the build thing, so just return it
              Positioning.position(sink, toolbarSpec.backstage.shared.anchors.toolbarOverflow(), overflow);
              return Option.some(overflow);
            } else {
              return Option.none();
            }
          });
        }
      );
    });
  };

  const primary = SplitAlloyToolbar.parts().primary({
    dom: {
      tag: 'div',
      classes: ['tox-toolbar__primary']
    }
  });

  const splitToolbarComponents = toolbarSpec.moreDrawerData.floating ? [
    primary
  ] : [
    primary,
    SplitAlloyToolbar.parts().overflow({
      dom: {
        tag: 'div',
        classes: [ 'tox-toolbar__overflow' ]
      }
    })
  ];

  return SplitAlloyToolbar.sketch({
    uid: toolbarSpec.uid,
    dom: {
      tag: 'div',
      classes: ['tox-toolbar-overlord']
    },
    floating: toolbarSpec.moreDrawerData.floating,
    overflow: getOverflow,
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
      }, Option.none(), toolbarSpec.backstage.shared.providers)
    },
    components: splitToolbarComponents,
    markers: {
      openClass: 'tox-toolbar__overflow--open',
      closedClass: 'tox-toolbar__overflow--closed',
      growingClass: 'tox-toolbar__overflow--growing',
      shrinkingClass: 'tox-toolbar__overflow--shrinking',
      overflowToggledClass: ToolbarButtonClasses.Ticked
    },
    splitToolbarBehaviours: getToolbarbehaviours(toolbarSpec, modeName, Option.some(memOverflow))
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

    toolbarBehaviours: getToolbarbehaviours(toolbarSpec, modeName, Option.none())
  });
};

export { renderToolbarGroup, renderToolbar, renderMoreToolbar };