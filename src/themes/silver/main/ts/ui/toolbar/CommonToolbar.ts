/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyComponent,
  AlloyEvents,
  AlloySpec,
  Behaviour,
  Keying,
  Tabstopping,
  SplitToolbar as SplitAlloyToolbar,
  Toolbar as AlloyToolbar,
  ToolbarGroup as AlloyToolbarGroup,
  Focusing,
  Memento,
  GuiFactory,
  Attachment,
  Positioning
} from '@ephox/alloy';
import { Arr, Option, Result } from '@ephox/katamari';
import { renderIconButtonSpec } from '../general/Button';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { ToolbarButtonClasses } from './button/ButtonClasses';

export interface Toolbar {
  uid: string;
  cyclicKeying: boolean;
  onEscape: (comp: AlloyComponent) => Option<boolean>;
  initGroups: ToolbarGroup[];
  getSink: () => Result<AlloyComponent, string>;
  backstage: UiFactoryBackstage;
  floating: boolean;
}

export interface ToolbarGroup {
  title: Option<string>;
  items: AlloySpec[];
}

const renderToolbarGroupCommon = (foo: ToolbarGroup) => {
  const attributes = foo.title.fold(() => {
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

    items: foo.items,
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

const renderToolbarGroup = (foo: ToolbarGroup) => {
  return AlloyToolbarGroup.sketch(renderToolbarGroupCommon(foo));
};

const getToolbarbehaviours = (foo, modeName, overflowOpt) => {
  const onAttached = AlloyEvents.runOnAttached(function (component) {
    const groups = Arr.map(foo.initGroups, renderToolbarGroup);
    AlloyToolbar.setGroups(component, groups);
  });

  const eventBehaviours = overflowOpt.fold(() => [
    onAttached
  ],
    (memOverflow) => [
      onAttached,
      AlloyEvents.run('alloy.toolbar.toggle', (toolbar, se) => {
        foo.getSink().toOption().each((sink) => {
          memOverflow.getOpt(sink).fold(() => {
            // overflow isn't there yet ... so add it, and return the built thing
            const builtoverFlow = GuiFactory.build(memOverflow.asSpec());
            Attachment.attach(sink, builtoverFlow);
            Positioning.position(sink, foo.backstage.shared.anchors.toolbarOverflow(), builtoverFlow);
            SplitAlloyToolbar.refresh(toolbar);
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
      onEscape: foo.onEscape,
      selector: '.tox-toolbar__group'
    }),
    AddEventsBehaviour.config('toolbar-events', eventBehaviours)
  ]);
};

const renderMoreToolbar = (foo: Toolbar) => {
  const modeName: any = foo.cyclicKeying ? 'cyclic' : 'acyclic';

  const memOverflow = Memento.record(
    AlloyToolbar.sketch({
      dom: {
        tag: 'div',
        classes: ['tox-toolbar__overflow']
      }
    })
  );

  const getOverflow = (toolbar) => {
    return foo.getSink().toOption().bind((sink) => {
      return memOverflow.getOpt(sink).bind(
        (overflow) => {
          return SplitAlloyToolbar.getMoreButton(toolbar).bind((_moreButton) => {
            if (overflow.getSystem().isConnected()) {
              // you have the build thing, so just return it
              Positioning.position(sink, foo.backstage.shared.anchors.toolbarOverflow(), overflow);
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

  const splitToolbarComponents = foo.floating ? [
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
    uid: foo.uid,
    dom: {
      tag: 'div',
      classes: ['tox-toolbar-overlord']
    },
    floating: foo.floating,
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
      }, Option.none(), foo.backstage.shared.providers)
    },
    components: splitToolbarComponents,
    markers: {
      openClass: 'tox-toolbar__overflow--open',
      closedClass: 'tox-toolbar__overflow--closed',
      growingClass: 'tox-toolbar__overflow--growing',
      shrinkingClass: 'tox-toolbar__overflow--shrinking',
      overflowToggledClass: ToolbarButtonClasses.Ticked
    },
    splitToolbarBehaviours: getToolbarbehaviours(foo, modeName, Option.some(memOverflow))
  });
};

const renderToolbar = (foo: Toolbar) => {
  const modeName: any = foo.cyclicKeying ? 'cyclic' : 'acyclic';

  return AlloyToolbar.sketch({
    uid: foo.uid,
    dom: {
      tag: 'div',
      classes: ['tox-toolbar']
    },
    components: [
      AlloyToolbar.parts().groups({})
    ],

    toolbarBehaviours: getToolbarbehaviours(foo, modeName, Option.none())
  });
};

export {
  renderToolbarGroup,
  renderToolbar,
  renderMoreToolbar
};