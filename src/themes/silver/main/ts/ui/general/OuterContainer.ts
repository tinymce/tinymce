/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent,
  AlloySpec,
  Composite,
  Keying,
  RawDomSchema,
  Sketcher,
  Toolbar as AlloyToolbar,
  UiSketcher,
  Behaviour
} from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Arr, Option } from '@ephox/katamari';

import SilverMenubar from '../menus/menubar/SilverMenubar';
import * as Sidebar from '../sidebar/Sidebar';
import { renderMoreToolbar, renderToolbarGroup, renderToolbar } from '../toolbar/CommonToolbar';

export interface OuterContainerSketchSpec extends Sketcher.CompositeSketchSpec {
  dom: RawDomSchema;
  components: AlloySpec[];
  behaviours: Record<string, Behaviour.ConfiguredBehaviour<any, any>>;
}

export interface OuterContainerSketchDetail extends Sketcher.CompositeSketchDetail {
  dom: RawDomSchema;
  uid: string;
  behaviours: Record<string, Behaviour.ConfiguredBehaviour<any, any>>;
}
export interface OuterContainerSketch extends Sketcher.CompositeSketch<OuterContainerSketchSpec, OuterContainerSketchDetail>, OuterContainerApis {
}

interface OuterContainerApis {
  getSocket: (comp: AlloyComponent) => Option<AlloyComponent>;
  setSidebar: (comp: AlloyComponent, panelConfigs: Sidebar.SidebarConfig) => void;
  toggleSidebar: (comp: AlloyComponent, name: string) => void;
  whichSidebar: (comp: AlloyComponent) => string | null;
  // Maybe just change to ToolbarAnchor.
  getToolbar: (comp: AlloyComponent) => Option<AlloyComponent>;
  setToolbar: (comp: AlloyComponent, groups) => void;
  focusToolbar: (comp: AlloyComponent) => void;
  setMenubar: (comp: AlloyComponent, groups) => void;
  focusMenubar: (comp: AlloyComponent) => void;
}

const factory: UiSketcher.CompositeSketchFactory<OuterContainerSketchDetail, OuterContainerSketchSpec> = function (detail, components, spec) {
  const apis: OuterContainerApis = {
    getSocket(comp) {
      return Composite.parts.getPart(comp, detail, 'socket');
    },
    setSidebar(comp, panelConfigs) {
      Composite.parts.getPart(comp, detail, 'sidebar').each(
        (sidebar) => Sidebar.setSidebar(sidebar, panelConfigs)
      );
    },
    toggleSidebar(comp, name) {
      Composite.parts.getPart(comp, detail, 'sidebar').each(
        (sidebar) => Sidebar.toggleSidebar(sidebar, name)
      );
    },
    whichSidebar(comp) {
      return Composite.parts.getPart(comp, detail, 'sidebar').bind(
        Sidebar.whichSidebar
      ).getOrNull();
    },
    getToolbar(comp) {
      return Composite.parts.getPart(comp, detail, 'toolbar');
    },
    setToolbar(comp, groups) {
      Composite.parts.getPart(comp, detail, 'toolbar').each(function (toolbar) {
        AlloyToolbar.setGroups(toolbar, groups);
      });
    },
    focusToolbar(comp) {
      Composite.parts.getPart(comp, detail, 'toolbar').each(function (toolbar) {
        Keying.focusIn(toolbar);
      });
    },
    setMenubar(comp, menus) {
      Composite.parts.getPart(comp, detail, 'menubar').each(function (menubar) {
        SilverMenubar.setMenus(menubar, menus);
      });
    },
    focusMenubar(comp) {
      Composite.parts.getPart(comp, detail, 'menubar').each(function (menubar) {
        SilverMenubar.focus(menubar);
      });
    }
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    apis,
    behaviours: detail.behaviours
  };
};

const partMenubar = Composite.partType.optional({
  factory: SilverMenubar,
  name: 'menubar',
  schema: [
    FieldSchema.strict('dom'),
    FieldSchema.strict('getSink')
  ]
});
const partToolbar = Composite.partType.optional({
  factory: {
    sketch: (spec) => {
      const renderer = spec.split ? renderMoreToolbar : renderToolbar;
      return renderer({
        uid: spec.uid,
        onEscape: () => {
          spec.onEscape();
          return Option.some(true);
        },
        cyclicKeying: false,
        initGroups: [],
        backstage: spec.backstage
      });
    }
  },
  name: 'toolbar',
  schema: [
    FieldSchema.strict('dom'),
    FieldSchema.strict('onEscape')
  ]
});

const partSocket = Composite.partType.optional({
  // factory: Fun.identity,
  name: 'socket',
  schema: [
    FieldSchema.strict('dom')
  ]
});

const partSidebar = Composite.partType.optional({
  factory: {
    sketch: Sidebar.renderSidebar
  },
  name: 'sidebar',
  schema: [
    FieldSchema.strict('dom')
  ]
});

export default Sketcher.composite({
  name: 'OuterContainer',
  factory,
  configFields: [
    FieldSchema.strict('dom'),
    FieldSchema.strict('behaviours')
  ],
  partFields: [
    partMenubar,
    partToolbar,
    partSocket,
    partSidebar
  ],

  apis: {
    getSocket(apis, comp) {
      return apis.getSocket(comp);
    },
    setSidebar(apis, comp, panelConfigs) {
      apis.setSidebar(comp, panelConfigs);
    },
    toggleSidebar(apis, comp, name) {
      apis.toggleSidebar(comp, name);
    },
    whichSidebar(apis, comp) {
      return apis.whichSidebar(comp);
    },
    getToolbar(apis, comp) {
      return apis.getToolbar(comp);
    },
    setToolbar(apis, comp, grps) {
      const groups = Arr.map(grps, function (grp) {
        return renderToolbarGroup(grp);
      });

      apis.setToolbar(comp, groups);
    },

    // FIX: Dupe
    setMenubar(apis, comp, menus) {
      apis.setMenubar(comp, menus);
    },
    focusMenubar(apis, comp) {
      apis.focusMenubar(comp);
    },
    focusToolbar(apis, comp) {
      apis.focusToolbar(comp);
    }
  }
}) as OuterContainerSketch;