/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Composing, CustomEvent, Focusing, Replacing, Sliding, SlotContainer, SlotContainerTypes, SystemEvents, Tabstopping } from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { FooterBar as BridgeFooterBar } from '@ephox/bridge';
import { HTMLElement } from '@ephox/dom-globals';
import { Arr, Cell, Fun, Id, Obj, Option } from '@ephox/katamari';
import { Css, Height } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { SimpleBehaviours } from '../alien/SimpleBehaviours';
import { onControlAttached, onControlDetached } from '../controls/Controls';

export type FooterBarConfig = Record<string, BridgeFooterBar.FooterBarApi>;

const setup = (editor: Editor) => {
  const { footerbars } = editor.ui.registry.getAll();

  Arr.each(Obj.keys(footerbars), (name) => {
    const spec = footerbars[name];
    const isActive = () => Option.from(editor.queryCommandValue('ToggleFooterBar')).is(name);

    editor.ui.registry.addToggleButton(name, {
      icon: spec.icon,
      tooltip: spec.tooltip,
      onAction: (buttonApi) => {
        editor.execCommand('ToggleFooterBar', false, name);
        buttonApi.setActive(isActive());
      },
      onSetup: (buttonApi) => {
        const handleToggle = () => buttonApi.setActive(isActive());
        editor.on('ToggleFooterBar', handleToggle);
        return () => {
          editor.off('ToggleFooterBar', handleToggle);
        };
      }
    });
  });
};

const getApi = (comp: AlloyComponent): BridgeFooterBar.FooterBarInstanceApi => {
  return {
    element: (): HTMLElement => {
      return comp.element().dom();
    }
  };
};

const makePanels = (parts: SlotContainerTypes.SlotContainerParts, panelConfigs: FooterBarConfig) => {
  const specs = Arr.map(Obj.keys(panelConfigs), (name) => {
    const spec = panelConfigs[name];
    const bridged = ValueSchema.getOrDie(BridgeFooterBar.createFooterBar(spec));
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
          classes: ['tox-footerbar__pane']
        },
        behaviours: SimpleBehaviours.unnamedEvents([
          onControlAttached(spec, editorOffCell),
          onControlDetached(spec, editorOffCell),
          AlloyEvents.run<SystemEvents.AlloySlotVisibilityEvent>(SystemEvents.slotVisibility(), (panel, se) => {
            const data = se.event();
            const optPanelSpec = Arr.find(specs, (config) => config.name === data.name());
            optPanelSpec.each((panelSpec) => {
              const handler = data.visible() ? panelSpec.onShow : panelSpec.onHide;
              handler(panelSpec.getApi(panel));
            });
          })
        ])
      }
    );
  });
};

const makeFooterBar = (panelConfigs: FooterBarConfig) => SlotContainer.sketch((parts) => {
  return {
    dom: {
      tag: 'div',
      classes: ['tox-footerbar__pane-container']
    },
    components: makePanels(parts, panelConfigs),
    slotBehaviours: SimpleBehaviours.unnamedEvents([
      AlloyEvents.runOnAttached((slotContainer) => SlotContainer.hideAllSlots(slotContainer))
    ])
  };
});

const setFooterBar = (footer: AlloyComponent, panelConfigs: FooterBarConfig) => {
  const optSlider = Composing.getCurrent(footer);
  optSlider.each((slider) => Replacing.set(slider, [makeFooterBar(panelConfigs)]));
};

const toggleFooterBar = (footer: AlloyComponent, name: string) => {
  const optSlider = Composing.getCurrent(footer);
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

const whichFooterBar = (footer: AlloyComponent): Option<string> => {
  const optSlider = Composing.getCurrent(footer);
  return optSlider.bind((slider) => {
    const footerOpen = Sliding.isGrowing(slider) || Sliding.hasGrown(slider);
    if (footerOpen) {
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
  height: () => string;
}
const fixSize = Id.generate('FooterBarFixSizeEvent');
const autoSize = Id.generate('FooterBarAutoSizeEvent');

const renderFooterBar = (spec) => {
  return {
    uid: spec.uid,
    dom: {
      tag: 'div',
      classes: ['tox-footerbar'],
      attributes: {
        role: 'complimentary'
      }
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: ['tox-footerbar__slider']
        },
        components: [
          // this will be replaced on setFooterbar
        ],
        behaviours: Behaviour.derive([
          Tabstopping.config({ }),
          Focusing.config({ }),
          Sliding.config({
            dimension: {
              property: 'height'
            },
            closedClass: 'tox-footerbar--sliding-closed',
            openClass: 'tox-footerbar--sliding-open',
            shrinkingClass: 'tox-footerbar--sliding-shrinking',
            growingClass: 'tox-footerbar--sliding-growing',
            onShrunk: (slider: AlloyComponent) => {
              const optSlotContainer = Composing.getCurrent(slider);
              optSlotContainer.each(SlotContainer.hideAllSlots);
              AlloyTriggers.emit(slider, autoSize);
            },
            onGrown: (slider: AlloyComponent) => {
              AlloyTriggers.emit(slider, autoSize);
            },
            onStartGrow: (slider: AlloyComponent) => {
              AlloyTriggers.emitWith(slider, fixSize, { height: Css.getRaw(slider.element(), 'height').getOr('') });
            },
            onStartShrink: (slider: AlloyComponent) => {
              AlloyTriggers.emitWith(slider, fixSize, { height: Height.get(slider.element()) + 'px' });
            }
          }),
          Replacing.config({ }),
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
      AddEventsBehaviour.config('footerbar-sliding-event', [
        AlloyEvents.run<FixSizeEvent>(fixSize, (comp, se) => {
          Css.set(comp.element(), 'height', se.event().height());
        }),
        AlloyEvents.run(autoSize, (comp, se) => {
          Css.remove(comp.element(), 'height');
        })
      ])
    ])
  };
};

export { renderFooterBar, toggleFooterBar, setFooterBar, whichFooterBar, setup };
