// eslint-disable-next-line max-len
import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Boxes, Focusing, Keying, SketchSpec,
  SplitFloatingToolbar as AlloySplitFloatingToolbar,
  SplitSlidingToolbar as AlloySplitSlidingToolbar, Tabstopping, Toolbar as AlloyToolbar, ToolbarGroup as AlloyToolbarGroup
} from '@ephox/alloy';
import { Arr, Optional, Result } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

import { ToolbarMode } from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Channels from '../../Channels';
import * as ReadOnly from '../../ReadOnly';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { renderIconButtonSpec } from '../general/Button';
import { ToolbarButtonClasses } from './button/ButtonClasses';

export interface MoreDrawerData {
  readonly lazyMoreButton: () => AlloyComponent;
  readonly lazyToolbar: () => AlloyComponent;
  readonly lazyHeader: () => AlloyComponent;
}

export interface ToolbarSpec {
  readonly type: ToolbarMode;
  readonly uid: string;
  readonly cyclicKeying: boolean;
  readonly onEscape: (comp: AlloyComponent) => Optional<boolean>;
  readonly initGroups: ToolbarGroup[];
  readonly attributes?: Record<string, string>;
  readonly providers: UiFactoryBackstageProviders;
}

export interface MoreDrawerToolbarSpec extends ToolbarSpec {
  readonly getSink: () => Result<AlloyComponent, string>;
  readonly moreDrawerData: MoreDrawerData;
  readonly onToggled: (comp: AlloyComponent, state: boolean) => void;
}

export interface ToolbarGroup {
  readonly title: Optional<string>;
  readonly items: AlloySpec[];
}

const renderToolbarGroupCommon = (toolbarGroup: ToolbarGroup) => {
  const attributes = toolbarGroup.title.fold(() => ({}),
    (title) => ({ attributes: { title }}));
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar__group' ],
      ...attributes
    },

    components: [
      AlloyToolbarGroup.parts.items({})
    ],

    items: toolbarGroup.items,
    markers: {
      // nav within a group breaks if disabled buttons are first in their group so skip them
      itemSelector: '*:not(.tox-split-button) > .tox-tbtn:not([disabled]), ' +
                    '.tox-split-button:not([disabled]), ' +
                    '.tox-toolbar-nav-js:not([disabled]), ' +
                    '.tox-number-input:not([disabled])'
    },
    tgroupBehaviours: Behaviour.derive([
      Tabstopping.config({}),
      Focusing.config({})
    ])
  };
};

const renderToolbarGroup = (toolbarGroup: ToolbarGroup): SketchSpec =>
  AlloyToolbarGroup.sketch(renderToolbarGroupCommon(toolbarGroup));

const getToolbarBehaviours = (toolbarSpec: ToolbarSpec, modeName: 'cyclic' | 'acyclic') => {
  const onAttached = AlloyEvents.runOnAttached((component) => {
    const groups = Arr.map(toolbarSpec.initGroups, renderToolbarGroup);
    AlloyToolbar.setGroups(component, groups);
  });

  return Behaviour.derive([
    DisablingConfigs.toolbarButton(toolbarSpec.providers.isDisabled),
    ReadOnly.receivingConfig(),
    Keying.config({
      // Tabs between groups
      mode: modeName,
      onEscape: toolbarSpec.onEscape,
      selector: '.tox-toolbar__group'
    }),
    AddEventsBehaviour.config('toolbar-events', [ onAttached ])
  ]);
};

const renderMoreToolbarCommon = (toolbarSpec: MoreDrawerToolbarSpec) => {
  const modeName = toolbarSpec.cyclicKeying ? 'cyclic' : 'acyclic';

  return {
    uid: toolbarSpec.uid,
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar-overlord' ]
    },
    parts: {
      // This already knows it is a toolbar group
      'overflow-group': renderToolbarGroupCommon({
        title: Optional.none(),
        items: []
      }),
      'overflow-button': renderIconButtonSpec({
        name: 'more',
        icon: Optional.some('more-drawer'),
        enabled: true,
        tooltip: Optional.some('Reveal or hide additional toolbar items'),
        primary: false,
        buttonType: Optional.none(),
        borderless: false
      }, Optional.none(), toolbarSpec.providers)
    },
    splitToolbarBehaviours: getToolbarBehaviours(toolbarSpec, modeName)
  };
};

const renderFloatingMoreToolbar = (toolbarSpec: MoreDrawerToolbarSpec): SketchSpec => {
  const baseSpec = renderMoreToolbarCommon(toolbarSpec);
  const overflowXOffset = 4;

  const primary = AlloySplitFloatingToolbar.parts.primary({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar__primary' ]
    }
  });

  return AlloySplitFloatingToolbar.sketch({
    ...baseSpec,
    lazySink: toolbarSpec.getSink,
    getOverflowBounds: () => {
      // Restrict the left/right bounds to the editor header width, but don't restrict the top/bottom
      const headerElem = toolbarSpec.moreDrawerData.lazyHeader().element;
      const headerBounds = Boxes.absolute(headerElem);
      const docElem = Traverse.documentElement(headerElem);
      const docBounds = Boxes.absolute(docElem);
      const height = Math.max(docElem.dom.scrollHeight, docBounds.height);
      return Boxes.bounds(
        headerBounds.x + overflowXOffset,
        docBounds.y,
        headerBounds.width - overflowXOffset * 2,
        height
      );
    },
    parts: {
      ...baseSpec.parts,
      overflow: {
        dom: {
          tag: 'div',
          classes: [ 'tox-toolbar__overflow' ],
          attributes: toolbarSpec.attributes
        }
      }
    },
    components: [ primary ],
    markers: {
      overflowToggledClass: ToolbarButtonClasses.Ticked
    },
    onOpened: (comp) => toolbarSpec.onToggled(comp, true),
    onClosed: (comp) => toolbarSpec.onToggled(comp, false)
  });
};

const renderSlidingMoreToolbar = (toolbarSpec: MoreDrawerToolbarSpec): SketchSpec => {
  const primary = AlloySplitSlidingToolbar.parts.primary({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar__primary' ]
    }
  });

  const overflow = AlloySplitSlidingToolbar.parts.overflow({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar__overflow' ]
    }
  });

  const baseSpec = renderMoreToolbarCommon(toolbarSpec);

  return AlloySplitSlidingToolbar.sketch({
    ...baseSpec,
    components: [ primary, overflow ],
    markers: {
      openClass: 'tox-toolbar__overflow--open',
      closedClass: 'tox-toolbar__overflow--closed',
      growingClass: 'tox-toolbar__overflow--growing',
      shrinkingClass: 'tox-toolbar__overflow--shrinking',
      overflowToggledClass: ToolbarButtonClasses.Ticked
    },
    onOpened: (comp) => {
      // TINY-9223: This will only broadcast to the same mothership as the toolbar
      comp.getSystem().broadcastOn([ Channels.toolbarHeightChange() ], { type: 'opened' });
      toolbarSpec.onToggled(comp, true);
    },
    onClosed: (comp) => {
      // TINY-9223: This will only broadcast to the same mothership as the toolbar
      comp.getSystem().broadcastOn([ Channels.toolbarHeightChange() ], { type: 'closed' });
      toolbarSpec.onToggled(comp, false);
    }
  });
};

const renderToolbar = (toolbarSpec: ToolbarSpec): SketchSpec => {
  const modeName = toolbarSpec.cyclicKeying ? 'cyclic' : 'acyclic';

  return AlloyToolbar.sketch({
    uid: toolbarSpec.uid,
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar' ].concat(
        toolbarSpec.type === ToolbarMode.scrolling ? [ 'tox-toolbar--scrolling' ] : []
      )
    },
    components: [
      AlloyToolbar.parts.groups({})
    ],

    toolbarBehaviours: getToolbarBehaviours(toolbarSpec, modeName)
  });
};

export { renderToolbarGroup, renderToolbar, renderFloatingMoreToolbar, renderSlidingMoreToolbar };
