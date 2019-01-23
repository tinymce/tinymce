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
  GuiFactory,
  Attachment,
  Memento,
  Positioning
} from '@ephox/alloy';
import { Arr, Option, Result } from '@ephox/katamari';
import { UiFactoryBackstage } from '../../backstage/Backstage';

export interface Toolbar {
  uid: string;
  cyclicKeying: boolean;
  onEscape: (comp: AlloyComponent) => Option<boolean>;
  initGroups: ToolbarGroup[];
  getSink: () => Result<AlloyComponent, Error>;
  backstage: UiFactoryBackstage;
}

export interface ToolbarGroup {
  title: Option<string>;
  items: AlloySpec[];
}

const toolbarGroup = (foo: ToolbarGroup) => {
  const attributes = foo.title.fold(() => {
    return {};
  },
  (title) => {
    return { attributes: { title } };
  });
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar__group' ],
      ...attributes
    },

    components: [
      AlloyToolbarGroup.parts().items({ })
    ],

    items: foo.items,
    markers: {
      // nav within a group breaks if disabled buttons are first in their group so skip them
      itemSelector: '*:not(.tox-split-button) > .tox-tbtn:not([disabled]), .tox-split-button:not([disabled]), .tox-toolbar-nav-js:not([disabled])'
    }
  };
};

const renderToolbarGroup = (foo: ToolbarGroup) => {
  const attributes = foo.title.fold(() => {
    return {};
  },
  (title) => {
    return { attributes: { title } };
  });
  return AlloyToolbarGroup.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar__group' ],
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
      Tabstopping.config({ }),
      Focusing.config({ })
    ])
  });
};

const renderMoreToolbar = (foo: Toolbar) => {
  const modeName: any = foo.cyclicKeying ? 'cyclic' : 'acyclic';

  const memOverflow = Memento.record(
    AlloyToolbar.sketch({
      dom: {
        tag: 'div',
        classes: ['tox-toolbar-overflow']
      }
    })
  );

  const getOverflow = () => {
    return foo.getSink().toOption().map((sink) => {
      return memOverflow.getOpt(sink).fold(
        () => {
          // overflow isn't there yet ... so add it, and return the built thing
          const builtoverFlow = GuiFactory.build(memOverflow.asSpec());
          Attachment.attach(sink, builtoverFlow);
          Positioning.position(sink, foo.backstage.shared.anchors.toolbarOverflow(), builtoverFlow);
          return builtoverFlow;
        },
        (overflow) => {
          // you have the build thing, so just return it
          Positioning.position(sink, foo.backstage.shared.anchors.toolbarOverflow(), overflow);
          return overflow;
        }
      );
    });
  };

  return SplitAlloyToolbar.sketch({
    uid: foo.uid,
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar-overlord' ]
    },
    floating: true,
    overflow: getOverflow,
    parts: {
      // This already knows it is a toolbar group
      'overflow-group': toolbarGroup({
        title: Option.none(),
        items: [ ]
      }),
      'overflow-button': {
        dom: {
          tag: 'button',
          classes: [ 'example-more-button' ],
          innerHtml: 'More...'
        }
      }
    },
    components: [
      SplitAlloyToolbar.parts().primary({
        dom: {
          tag: 'div',
          classes: [ 'tox-toolbar-primary' ]
        }
      }),
      // SplitAlloyToolbar.parts().overflow({
      //   dom: {
      //     tag: 'div',
      //     classes: [ 'tox-toolbar-overflow' ]
      //   }
      // })
    ],
    markers: {
      openClass: 'example-overflow-open',
      closedClass: 'example-overflow-closed',
      growingClass: 'example-overflow-growing',
      shrinkingClass: 'example-overflow-shrinking'
    },
    splitToolbarBehaviours: Behaviour.derive([
      Keying.config({
        // Tabs between groups
        mode: modeName,
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

const renderToolbar = (foo: Toolbar) => {
  const modeName: any = foo.cyclicKeying ? 'cyclic' : 'acyclic';

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
        mode: modeName,
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
  renderToolbar,
  renderMoreToolbar
};