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
  AlloyTriggers,
  Behaviour,
  Composing,
  CustomEvent,
  Replacing,
  Sliding,
  SystemEvents,
  Tabstopping,
  Focusing,
} from '@ephox/alloy';
import { SlotContainer } from '@ephox/alloy/lib/main/ts/ephox/alloy/api/ui/SlotContainer';
import { SlotContainerParts } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/SlotContainerTypes';
import { HTMLElement } from '@ephox/dom-globals';
import { Arr, Id, Option } from '@ephox/katamari';
import { Css, Width } from '@ephox/sugar';
import { SidebarConfig, UiSidebarApi } from 'tinymce/core/api/Editor';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { SimpleBehaviours } from '../alien/SimpleBehaviours';

const api = function (comp: AlloyComponent): UiSidebarApi {
  return {
    element(): HTMLElement {
      return comp.element().dom();
    }
  };
};

const makePanels = (parts: SlotContainerParts, panelConfigs: SidebarConfig[]) => {
  return Arr.map(panelConfigs, (config) => {
    const name = config.name;
    const settings = config.settings;
    return parts.slot(
      name,
      {
        dom: {
          tag: 'div',
          classes: ['tox-sidebar__pane']
        },
        behaviours: SimpleBehaviours.unnamedEvents([
          AlloyEvents.runOnAttached((sidepanel) => {
            if (settings.onrender) {
              settings.onrender(api(sidepanel));
            }
          }),
          AlloyEvents.run<SystemEvents.AlloySlotVisibilityEvent>(SystemEvents.slotVisibility(), (sidepanel, se) => {
            const data = se.event();
            const optSidePanelConfig = Arr.find(panelConfigs, (config) => config.name === data.name());
            optSidePanelConfig.each((sidePanelConfig) => {
              const settings = sidePanelConfig.settings;
              const handler = data.visible() ? settings.onshow : settings.onhide;
              if (handler) {
                handler(api(sidepanel));
              }
            });
          })
        ])
      }
    );
  });
};

const makeSidebar = (panelConfigs: SidebarConfig[]) => SlotContainer.sketch((parts) => {
  return {
    dom: {
      tag: 'div',
      classes: ['tox-sidebar__pane-container'],
    },
    components: makePanels(parts, panelConfigs),
    slotBehaviours: SimpleBehaviours.unnamedEvents([
      AlloyEvents.runOnAttached((slotContainer) => SlotContainer.hideAllSlots(slotContainer))
    ])
  };
});

const setSidebar = (sidebar: AlloyComponent, panelConfigs: SidebarConfig[]) => {
  const optSlider = Composing.getCurrent(sidebar);
  optSlider.each((slider) => Replacing.set(slider, [makeSidebar(panelConfigs)]));
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

const renderSidebar = (spec) => {
  return {
    uid: spec.uid,
    dom: {
      tag: 'div',
      classes: ['tox-sidebar'],
      attributes: {
        role: 'complementary'
      }
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: ['tox-sidebar__slider']
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
        AlloyEvents.run(autoSize, (comp, se) => {
          Css.remove(comp.element(), 'width');
        })
      ])
    ])
  };
};

export const Sidebar = {
  setSidebar,
  toggleSidebar,
  whichSidebar,
  renderSidebar,
};