import {
  AlloyComponent, AlloySpec, Behaviour, Composite, CustomList, Keying, RawDomSchema, Sketcher, SketchSpec, Toolbar, UiSketcher
} from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Arr, Id, Optional, Optionals, Result } from '@ephox/katamari';

import { ToolbarMode } from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { HeaderSpec, renderHeader } from '../header/CommonHeader';
import SilverMenubar, { MenubarItemSpec, SilverMenubarSpec } from '../menus/menubar/SilverMenubar';
import { renderPromotion } from '../promotion/Promotion';
import * as Sidebar from '../sidebar/Sidebar';
import * as Throbber from '../throbber/Throbber';
import {
  MoreDrawerData, MoreDrawerToolbarSpec, renderFloatingMoreToolbar, renderSlidingMoreToolbar, renderToolbar, renderToolbarGroup, ToolbarGroup
} from '../toolbar/CommonToolbar';

export interface OuterContainerSketchSpec extends Sketcher.CompositeSketchSpec {
  readonly dom: RawDomSchema;
  readonly components: AlloySpec[];
  readonly behaviours: Behaviour.AlloyBehaviourRecord;
}

export interface OuterContainerSketchDetail extends Sketcher.CompositeSketchDetail {
  readonly dom: RawDomSchema;
  readonly uid: string;
  readonly behaviours: Behaviour.AlloyBehaviourRecord;
}

export interface OuterContainerSketch extends Sketcher.CompositeSketch<OuterContainerSketchSpec>, OuterContainerApis {
}

interface MultipleToolbarSketchSpec {
  readonly uid?: string;
  readonly dom: RawDomSchema;
  readonly onEscape: () => { };
  readonly type: ToolbarMode;
  readonly providers: UiFactoryBackstageProviders;
}

interface ToolbarSketchSpec extends MoreDrawerData {
  readonly uid?: string;
  readonly dom: RawDomSchema;
  readonly attributes?: Record<string, string>;
  readonly onEscape: () => { };
  readonly type: ToolbarMode;
  readonly getSink: () => Result<AlloyComponent, string>;
  readonly providers: UiFactoryBackstageProviders;
}

interface OuterContainerApis {
  readonly getHeader: (comp: AlloyComponent) => Optional<AlloyComponent>;
  readonly getSocket: (comp: AlloyComponent) => Optional<AlloyComponent>;
  readonly setSidebar: (comp: AlloyComponent, panelConfigs: Sidebar.SidebarConfig, showSidebar?: string) => void;
  readonly toggleSidebar: (comp: AlloyComponent, name: string) => void;
  readonly whichSidebar: (comp: AlloyComponent) => string | null;
  // Maybe just change to ToolbarAnchor.
  readonly getToolbar: (comp: AlloyComponent) => Optional<AlloyComponent>;
  readonly setToolbar: (comp: AlloyComponent, groups: ToolbarGroup[]) => void;
  readonly setToolbars: (comp: AlloyComponent, toolbars: ToolbarGroup[][]) => void;
  readonly refreshToolbar: (comp: AlloyComponent) => void;
  readonly toggleToolbarDrawer: (comp: AlloyComponent) => void;
  readonly isToolbarDrawerToggled: (comp: AlloyComponent) => boolean;
  readonly getThrobber: (comp: AlloyComponent) => Optional<AlloyComponent>;
  readonly focusToolbar: (comp: AlloyComponent) => void;
  readonly setMenubar: (comp: AlloyComponent, groups: MenubarItemSpec[]) => void;
  readonly focusMenubar: (comp: AlloyComponent) => void;
}

interface ToolbarApis {
  readonly setGroups: (toolbar: AlloyComponent, groups: SketchSpec[]) => void;
  readonly refresh: (toolbar: AlloyComponent) => void;
  readonly toggle?: (toolbar: AlloyComponent) => void;
  readonly isOpen?: (toolbar: AlloyComponent) => boolean;
}

const factory: UiSketcher.CompositeSketchFactory<OuterContainerSketchDetail, OuterContainerSketchSpec> = (detail, components, _spec) => {
  const apis: OuterContainerApis = {
    getSocket: (comp) => {
      return Composite.parts.getPart(comp, detail, 'socket');
    },
    setSidebar: (comp, panelConfigs, showSidebar) => {
      Composite.parts.getPart(comp, detail, 'sidebar').each(
        (sidebar) => Sidebar.setSidebar(sidebar, panelConfigs, showSidebar)
      );
    },
    toggleSidebar: (comp, name) => {
      Composite.parts.getPart(comp, detail, 'sidebar').each(
        (sidebar) => Sidebar.toggleSidebar(sidebar, name)
      );
    },
    whichSidebar: (comp) => {
      return Composite.parts.getPart(comp, detail, 'sidebar').bind(
        Sidebar.whichSidebar
      ).getOrNull();
    },
    getHeader: (comp) => {
      return Composite.parts.getPart(comp, detail, 'header');
    },
    getToolbar: (comp) => {
      return Composite.parts.getPart(comp, detail, 'toolbar');
    },
    setToolbar: (comp, groups) => {
      Composite.parts.getPart(comp, detail, 'toolbar').each((toolbar) => {
        const renderedGroups = Arr.map(groups, renderToolbarGroup);
        toolbar.getApis<ToolbarApis>().setGroups(toolbar, renderedGroups);
      });
    },
    setToolbars: (comp, toolbars) => {
      Composite.parts.getPart(comp, detail, 'multiple-toolbar').each((mToolbar) => {
        const renderedToolbars = Arr.map(toolbars, (g) => Arr.map(g, renderToolbarGroup));
        CustomList.setItems(mToolbar, renderedToolbars);
      });
    },
    refreshToolbar: (comp) => {
      const toolbar = Composite.parts.getPart(comp, detail, 'toolbar');
      toolbar.each((toolbar) => toolbar.getApis<ToolbarApis>().refresh(toolbar));
    },
    toggleToolbarDrawer: (comp) => {
      Composite.parts.getPart(comp, detail, 'toolbar').each((toolbar) => {
        Optionals.mapFrom(toolbar.getApis<ToolbarApis>().toggle, (toggle) => toggle(toolbar));
      });
    },
    isToolbarDrawerToggled: (comp) => {
      // isOpen may not be defined on all toolbars e.g. 'scrolling' and 'wrap'
      return Composite.parts.getPart(comp, detail, 'toolbar')
        .bind((toolbar) => Optional.from(toolbar.getApis<ToolbarApis>().isOpen).map((isOpen) => isOpen(toolbar)))
        .getOr(false);
    },
    getThrobber: (comp) => {
      return Composite.parts.getPart(comp, detail, 'throbber');
    },
    focusToolbar: (comp) => {
      const optToolbar = Composite.parts.getPart(comp, detail, 'toolbar').orThunk(() => Composite.parts.getPart(comp, detail, 'multiple-toolbar'));

      optToolbar.each((toolbar) => {
        Keying.focusIn(toolbar);
      });
    },
    setMenubar: (comp, menus) => {
      Composite.parts.getPart(comp, detail, 'menubar').each((menubar) => {
        SilverMenubar.setMenus(menubar, menus);
      });
    },
    focusMenubar: (comp) => {
      Composite.parts.getPart(comp, detail, 'menubar').each((menubar) => {
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

const partMenubar = Composite.partType.optional<OuterContainerSketchDetail, SilverMenubarSpec>({
  factory: SilverMenubar,
  name: 'menubar',
  schema: [
    FieldSchema.required('backstage')
  ]
});

const toolbarFactory = (spec: ToolbarSketchSpec) => {
  if (spec.type === ToolbarMode.sliding) {
    return renderSlidingMoreToolbar;
  } else if (spec.type === ToolbarMode.floating) {
    return renderFloatingMoreToolbar;
  } else {
    return renderToolbar;
  }
};

const partMultipleToolbar = Composite.partType.optional<OuterContainerSketchDetail, MultipleToolbarSketchSpec>({
  factory: {
    sketch: (spec) => CustomList.sketch({
      uid: spec.uid,
      dom: spec.dom,

      listBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'acyclic',
          selector: '.tox-toolbar'
        })
      ]),

      makeItem: () => renderToolbar({
        type: spec.type,
        uid: Id.generate('multiple-toolbar-item'),
        cyclicKeying: false,
        initGroups: [ ],
        providers: spec.providers,
        onEscape: () => {
          spec.onEscape();
          return Optional.some(true);
        }
      }),
      setupItem: (_mToolbar, tc, data, _index) => {
        Toolbar.setGroups(tc, data);
      },
      shell: true
    })
  },
  name: 'multiple-toolbar',
  schema: [
    FieldSchema.required('dom'),
    FieldSchema.required('onEscape')
  ]
});

const partToolbar = Composite.partType.optional<OuterContainerSketchDetail, ToolbarSketchSpec>({
  factory: {
    sketch: (spec) => {
      const renderer = toolbarFactory(spec);
      const toolbarSpec: MoreDrawerToolbarSpec = {
        type: spec.type,
        uid: spec.uid,
        onEscape: () => {
          spec.onEscape();
          return Optional.some(true);
        },
        cyclicKeying: false,
        initGroups: [],
        getSink: spec.getSink,
        providers: spec.providers,
        moreDrawerData: {
          lazyToolbar: spec.lazyToolbar,
          lazyMoreButton: spec.lazyMoreButton,
          lazyHeader: spec.lazyHeader
        },
        attributes: spec.attributes
      };
      return renderer(toolbarSpec);
    }
  },
  name: 'toolbar',
  schema: [
    FieldSchema.required('dom'),
    FieldSchema.required('onEscape'),
    FieldSchema.required('getSink')
  ]
});

const partHeader = Composite.partType.optional<OuterContainerSketchDetail, HeaderSpec>({
  factory: {
    sketch: renderHeader
  },
  name: 'header',
  schema: [
    FieldSchema.required('dom')
  ]
});

const partPromotion = Composite.partType.optional<OuterContainerSketchDetail, HeaderSpec>({
  factory: {
    sketch: renderPromotion
  },
  name: 'promotion',
  schema: [
    FieldSchema.required('dom')
  ]
});

const partSocket = Composite.partType.optional({
  // factory: Fun.identity,
  name: 'socket',
  schema: [
    FieldSchema.required('dom')
  ]
});

const partSidebar = Composite.partType.optional({
  factory: {
    sketch: Sidebar.renderSidebar
  },
  name: 'sidebar',
  schema: [
    FieldSchema.required('dom')
  ]
});

const partThrobber = Composite.partType.optional({
  factory: {
    sketch: Throbber.renderThrobber
  },
  name: 'throbber',
  schema: [
    FieldSchema.required('dom')
  ]
});

export default Sketcher.composite<OuterContainerSketchSpec, OuterContainerSketchDetail, OuterContainerApis>({
  name: 'OuterContainer',
  factory,
  configFields: [
    FieldSchema.required('dom'),
    FieldSchema.required('behaviours')
  ],
  partFields: [
    partHeader,
    partMenubar,
    partToolbar,
    partMultipleToolbar,
    partSocket,
    partSidebar,
    partPromotion,
    partThrobber
  ],

  apis: {
    getSocket: (apis, comp) => {
      return apis.getSocket(comp);
    },
    setSidebar: (apis, comp, panelConfigs, showSidebar) => {
      apis.setSidebar(comp, panelConfigs, showSidebar);
    },
    toggleSidebar: (apis, comp, name) => {
      apis.toggleSidebar(comp, name);
    },
    whichSidebar: (apis, comp) => {
      return apis.whichSidebar(comp);
    },
    getHeader: (apis, comp) => {
      return apis.getHeader(comp);
    },
    getToolbar: (apis, comp) => {
      return apis.getToolbar(comp);
    },
    setToolbar: (apis, comp, groups) => {
      apis.setToolbar(comp, groups);
    },
    setToolbars: (apis, comp, toolbars) => {
      apis.setToolbars(comp, toolbars);
    },
    refreshToolbar: (apis, comp) => {
      return apis.refreshToolbar(comp);
    },
    toggleToolbarDrawer: (apis, comp) => {
      apis.toggleToolbarDrawer(comp);
    },
    isToolbarDrawerToggled: (apis, comp) => {
      return apis.isToolbarDrawerToggled(comp);
    },
    getThrobber: (apis, comp) => {
      return apis.getThrobber(comp);
    },
    // FIX: Dupe
    setMenubar: (apis, comp, menus) => {
      apis.setMenubar(comp, menus);
    },
    focusMenubar: (apis, comp) => {
      apis.focusMenubar(comp);
    },
    focusToolbar: (apis, comp) => {
      apis.focusToolbar(comp);
    }
  }
}) as OuterContainerSketch;
