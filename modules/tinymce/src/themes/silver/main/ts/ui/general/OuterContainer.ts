/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent,
  AlloySpec,
  Behaviour,
  CustomList,
  Composite,
  Keying,
  RawDomSchema,
  Toolbar,
  Sketcher,
  SketchSpec,
  UiSketcher
} from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Arr, Id, Option } from '@ephox/katamari';

import SilverMenubar from '../menus/menubar/SilverMenubar';
import * as Sidebar from '../sidebar/Sidebar';
import * as Throbber from '../throbber/Throbber';
import { renderFloatingMoreToolbar, renderSlidingMoreToolbar, renderToolbarGroup, renderToolbar, ToolbarSpec } from '../toolbar/CommonToolbar';
import { ToolbarDrawer } from '../../api/Settings';

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
  setToolbars: (comp: AlloyComponent, toolbars) => void;
  refreshToolbar: (comp: AlloyComponent) => void;
  getMoreButton: (comp: AlloyComponent) => Option<AlloyComponent>;
  getThrobber: (comp: AlloyComponent) => Option<AlloyComponent>;
  focusToolbar: (comp: AlloyComponent) => void;
  setMenubar: (comp: AlloyComponent, groups) => void;
  focusMenubar: (comp: AlloyComponent) => void;
}

interface ToolbarApis {
  setGroups: (toolbar: AlloyComponent, groups: SketchSpec[]) => void;
  refresh: (toolbar: AlloyComponent) => void;
  getMoreButton: (toolbar: AlloyComponent) => Option<AlloyComponent>;
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
      Composite.parts.getPart(comp, detail, 'toolbar').each((toolbar) => {
        toolbar.getApis<ToolbarApis>().setGroups(toolbar, groups);
      });
    },
    setToolbars(comp, toolbars) {
      Composite.parts.getPart(comp, detail, 'multiple-toolbar').each((mToolbar) => {
        CustomList.setItems(mToolbar, toolbars);
      });
    },
    refreshToolbar(comp) {
      const toolbar = Composite.parts.getPart(comp, detail, 'toolbar');
      toolbar.each((toolbar) => {
        return toolbar.getApis<ToolbarApis>().refresh(toolbar);
      });
    },
    getMoreButton(comp) {
      const toolbar = Composite.parts.getPart(comp, detail, 'toolbar');
      return toolbar.bind((toolbar) => {
        return toolbar.getApis<ToolbarApis>().getMoreButton(toolbar);
      });
    },
    getThrobber(comp) {
      return Composite.parts.getPart(comp, detail, 'throbber');
    },
    focusToolbar(comp) {
      const optToolbar = Composite.parts.getPart(comp, detail, 'toolbar').orThunk(() => {
        return Composite.parts.getPart(comp, detail, 'multiple-toolbar');
      });

      optToolbar.each(function (toolbar) {
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
    FieldSchema.strict('backstage')
  ]
});

const toolbarFactory = (spec) => {
  if (spec.split === ToolbarDrawer.sliding) {
    return renderSlidingMoreToolbar;
  } else if (spec.split === ToolbarDrawer.floating) {
    return renderFloatingMoreToolbar;
  } else {
    return renderToolbar;
  }
};

const partMultipleToolbar = Composite.partType.optional({
  factory: {
    sketch: (spec) => {
      return CustomList.sketch({
        uid: spec.uid,
        dom: spec.dom,

        listBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'acyclic',
            selector: '.tox-toolbar'
          })
        ]),

        makeItem: () => {
          return renderToolbar({
            uid: Id.generate('multiple-toolbar-item'),
            backstage: spec.backstage,
            cyclicKeying: false,
            getSink: spec.getSink,
            initGroups: [ ],
            onEscape: () => Option.none()
          });
        },
        setupItem: (mToolbar, tc, data, index) => {
          Toolbar.setGroups(tc, data);
        },
        shell: true
      });
    }
  },
  name: 'multiple-toolbar',
  schema: [
    FieldSchema.strict('dom'),
    FieldSchema.strict('onEscape')
  ]
});

const partToolbar = Composite.partType.optional({
  factory: {
    sketch: (spec) => {
      const renderer = toolbarFactory(spec);
      const toolbarSpec: ToolbarSpec = {
        uid: spec.uid,
        onEscape: () => {
          spec.onEscape();
          return Option.some(true);
        },
        cyclicKeying: false,
        initGroups: [],
        getSink: spec.getSink,
        backstage: spec.backstage,
        moreDrawerData: {
          lazyToolbar: spec.lazyToolbar,
          lazyMoreButton: spec.lazyMoreButton
        }
      };
      return renderer(toolbarSpec);
    }
  },
  name: 'toolbar',
  schema: [
    FieldSchema.strict('dom'),
    FieldSchema.strict('onEscape'),
    FieldSchema.strict('getSink')
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

const partThrobber = Composite.partType.optional({
  factory: {
    sketch: Throbber.renderThrobber
  },
  name: 'throbber',
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
    partMultipleToolbar,
    partSocket,
    partSidebar,
    partThrobber
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
    setToolbars(apis, comp, ts) {
      const renderedToolbars = Arr.map(ts, (g) => {
        return Arr.map(g, renderToolbarGroup);
      });

      apis.setToolbars(comp, renderedToolbars);
    },
    getMoreButton(apis, comp) {
      return apis.getMoreButton(comp);
    },
    refreshToolbar(apis, comp) {
      return apis.refreshToolbar(comp);
    },
    getThrobber(apis, comp) {
      return apis.getThrobber(comp);
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