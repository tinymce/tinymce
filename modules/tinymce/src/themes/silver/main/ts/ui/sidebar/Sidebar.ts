/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Composing, CustomEvent, Focusing, Replacing, Sliding,
  SlotContainer, SlotContainerTypes, SystemEvents, Tabstopping
} from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { Sidebar as BridgeSidebar } from '@ephox/bridge';
import { HTMLElement } from '@ephox/dom-globals';
import { Arr, Cell, Fun, Id, Obj, Option } from '@ephox/katamari';
import { Css, Width } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { onControlAttached, onControlDetached } from 'tinymce/themes/silver/ui/controls/Controls';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { SimpleBehaviours } from '../alien/SimpleBehaviours';

export type SidebarConfig = Record<string, BridgeSidebar.SidebarApi>;

const setup = (editor: Editor) => {
  const { sidebars } = editor.ui.registry.getAll();

  // Setup each registered sidebar
  Arr.each(Obj.keys(sidebars), (name) => {
    const spec = sidebars[name];
    const isActive = () => Option.from(editor.queryCommandValue('ToggleSidebar')).is(name);
    editor.ui.registry.addToggleButton(name, {
      icon: spec.icon,
      tooltip: spec.tooltip,
      onAction: (buttonApi) => {
        editor.execCommand('ToggleSidebar', false, name);
        buttonApi.setActive(isActive());
      },
      onSetup: (buttonApi) => {
        const handleToggle = () => buttonApi.setActive(isActive());
        editor.on('ToggleSidebar', handleToggle);
        return () => {
          editor.off('ToggleSidebar', handleToggle);
        };
      }
    });
  });
};

const getApi = (comp: AlloyComponent): BridgeSidebar.SidebarInstanceApi => ({
  element: (): HTMLElement => comp.element().dom()
});

const makePanels = (parts: SlotContainerTypes.SlotContainerParts, panelConfigs: SidebarConfig) => {
  const specs = Arr.map(Obj.keys(panelConfigs), (name) => {
    const spec = panelConfigs[name];
    const bridged = ValueSchema.getOrDie(BridgeSidebar.createSidebar(spec));
    return {
      name,
      getApi,
      onSetup: bridged.onSetup,
      onShow: bridged.onShow,
      onHide: bridged.onHide
    };
  });

  return Arr.map(specs, (spec) => {
    const editorOffCell = Cell(Fun.noop);
    return parts.slot(
      spec.name,
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-sidebar__pane' ]
        },
        behaviours: SimpleBehaviours.unnamedEvents([
          onControlAttached(spec, editorOffCell),
          onControlDetached(spec, editorOffCell),
          AlloyEvents.run<SystemEvents.AlloySlotVisibilityEvent>(SystemEvents.slotVisibility(), (sidepanel, se) => {
            const data = se.event();
            const optSidePanelSpec = Arr.find(specs, (config) => config.name === data.name());
            optSidePanelSpec.each((sidePanelSpec) => {
              const handler = data.visible() ? sidePanelSpec.onShow : sidePanelSpec.onHide;
              handler(sidePanelSpec.getApi(sidepanel));
            });
          })
        ])
      }
    );
  });
};

const makeSidebar = (panelConfigs: SidebarConfig) => SlotContainer.sketch((parts) => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-sidebar__pane-container' ]
  },
  components: makePanels(parts, panelConfigs),
  slotBehaviours: SimpleBehaviours.unnamedEvents([
    AlloyEvents.runOnAttached((slotContainer) => SlotContainer.hideAllSlots(slotContainer))
  ])
}));

const setSidebar = (sidebar: AlloyComponent, panelConfigs: SidebarConfig) => {
  const optSlider = Composing.getCurrent(sidebar);
  optSlider.each((slider) => Replacing.set(slider, [ makeSidebar(panelConfigs) ]));
};

const toggleSidebar = (sidebar: AlloyComponent, name: string) => {
  const optSlider = Composing.getCurrent(sidebar);
  optSlider.each((slider) => {
    const optSlotContainer = Composing.getCurrent(slider);
    optSlotContainer.each((slotContainer) => {
      if (Sliding.hasGrown(slider)) {
        if (SlotContainer.isShowing(slotContainer, name)) {
          // close the slider and then hide the slot after the animation finishes
          Sliding.shrink(slider);
        } else {
          SlotContainer.hideAllSlots(slotContainer);
          SlotContainer.showSlot(slotContainer, name);
        }
      } else {
        // Should already be hidden if the animation has finished but if it has not we hide them
        SlotContainer.hideAllSlots(slotContainer);
        SlotContainer.showSlot(slotContainer, name);
        Sliding.grow(slider);
      }
    });
  });
};

const whichSidebar = (sidebar: AlloyComponent): Option<string> => {
  const optSlider = Composing.getCurrent(sidebar);
  return optSlider.bind((slider) => {
    const sidebarOpen = Sliding.isGrowing(slider) || Sliding.hasGrown(slider);
    if (sidebarOpen) {
      const optSlotContainer = Composing.getCurrent(slider);
      return optSlotContainer.bind((slotContainer) =>
        Arr.find(SlotContainer.getSlotNames(slotContainer), (name) =>
          SlotContainer.isShowing(slotContainer, name)
        )
      );
    } else {
      return Option.none();
    }
  });
};

interface FixSizeEvent extends CustomEvent {
  width: () => string;
}
const fixSize = Id.generate('FixSizeEvent');
const autoSize = Id.generate('AutoSizeEvent');

const renderSidebar = (spec) => ({
  uid: spec.uid,
  dom: {
    tag: 'div',
    classes: [ 'tox-sidebar' ],
    attributes: {
      role: 'complementary'
    }
  },
  components: [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-sidebar__slider' ]
      },
      components: [
        // this will be replaced on setSidebar
      ],
      behaviours: Behaviour.derive([
        Tabstopping.config({ }),
        Focusing.config({ }), // TODO use Keying and use focusIn, but need to handle if sidebar contains nothing
        Sliding.config({
          dimension: {
            property: 'width'
          },
          closedClass: 'tox-sidebar--sliding-closed',
          openClass: 'tox-sidebar--sliding-open',
          shrinkingClass: 'tox-sidebar--sliding-shrinking',
          growingClass: 'tox-sidebar--sliding-growing',
          onShrunk: (slider: AlloyComponent) => {
            const optSlotContainer = Composing.getCurrent(slider);
            optSlotContainer.each(SlotContainer.hideAllSlots);
            AlloyTriggers.emit(slider, autoSize);
          },
          onGrown: (slider: AlloyComponent) => {
            AlloyTriggers.emit(slider, autoSize);
          },
          onStartGrow: (slider: AlloyComponent) => {
            AlloyTriggers.emitWith(slider, fixSize, { width: Css.getRaw(slider.element(), 'width').getOr('') });
          },
          onStartShrink: (slider: AlloyComponent) => {
            AlloyTriggers.emitWith(slider, fixSize, { width: Width.get(slider.element()) + 'px' });
          }
        }),
        Replacing.config({}),
        Composing.config({
          find: (comp: AlloyComponent) => {
            const children = Replacing.contents(comp);
            return Arr.head(children);
          }
        })
      ])
    }
  ],
  behaviours: Behaviour.derive([
    ComposingConfigs.childAt(0),
    AddEventsBehaviour.config('sidebar-sliding-events', [
      AlloyEvents.run<FixSizeEvent>(fixSize, (comp, se) => {
        Css.set(comp.element(), 'width', se.event().width());
      }),
      AlloyEvents.run(autoSize, (comp, _se) => {
        Css.remove(comp.element(), 'width');
      })
    ])
  ])
});

export {
  setSidebar,
  toggleSidebar,
  whichSidebar,
  renderSidebar,
  setup
};
