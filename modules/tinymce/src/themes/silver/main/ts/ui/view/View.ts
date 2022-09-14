import { AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Composing, Replacing, SketchSpec, SlotContainer, SlotContainerTypes } from '@ephox/alloy';
import { View as BridgeView } from '@ephox/bridge';
import { Arr, Obj, Optional } from '@ephox/katamari';
import { Attribute, Css } from '@ephox/sugar';

import { SimpleBehaviours } from '../alien/SimpleBehaviours';

export type ViewConfig = Record<string, BridgeView.ViewSpec>;

export const renderCustomViewWrapper = (spec: SketchSpec): AlloySpec => ({
  uid: spec.uid,
  dom: {
    tag: 'div',
    classes: [ 'tox-custom-view-wrapper' ]
  },
  components: [
    // this will be replaced on setViews
  ],
  behaviours: Behaviour.derive([
    Replacing.config({}),
    Composing.config({
      find: (comp: AlloyComponent) => {
        const children = Replacing.contents(comp);
        return Arr.head(children);
      }
    })
  ])
});

const renderViewToolbar = (_spec: BridgeView.ViewSpec) => {
  return {
    dom: {
      tag: 'div',
      innerHtml: 'code'
    }
  };
};

const renderViewSlot = () => {
  return {
    dom: {
      tag: 'div'
    }
  };
};

const makeViews = (parts: SlotContainerTypes.SlotContainerParts, viewConfigs: ViewConfig) => {
  return Obj.mapToArray(viewConfigs, (spec, name) => {
    return parts.slot(name, {
      dom: {
        tag: 'div',
        classes: [ 'tox-custom-view' ]
      },
      components: [ renderViewToolbar(spec), renderViewSlot() ]
    });
  });
};

const makeSlotContainer = (viewConfigs: ViewConfig) => SlotContainer.sketch((parts) => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-custom-view-wrapper__slot-container' ]
  },
  components: makeViews(parts, viewConfigs),
  slotBehaviours: SimpleBehaviours.unnamedEvents([
    AlloyEvents.runOnAttached((slotContainer) => SlotContainer.hideAllSlots(slotContainer))
  ])
}));

const getCurrentName = (slotContainer: AlloyComponent) => {
  return Arr.find(SlotContainer.getSlotNames(slotContainer), (name) =>
    SlotContainer.isShowing(slotContainer, name)
  );
};

const hideEditorContainer = (comp: AlloyComponent) => {
  const element = comp.element;
  Css.set(element, 'display', 'none');
  Attribute.set(element, 'aria-hidden', 'true');
};

const showEditorContainer = (comp: AlloyComponent) => {
  const element = comp.element;
  Css.remove(element, 'display');
  Attribute.remove(element, 'aria-hidden');
};

export const setViews = (comp: AlloyComponent, viewConfigs: ViewConfig): void => {
  Replacing.set(comp, [ makeSlotContainer(viewConfigs) ]);
};

export const whichView = (comp: AlloyComponent): Optional<string> => {
  return Composing.getCurrent(comp).bind(getCurrentName);
};

export const toggleView = (comp: AlloyComponent, editorCont: AlloyComponent, name: string): void => {
  Composing.getCurrent(comp).each((slotContainer) => {
    const hasSameName = getCurrentName(slotContainer).exists((current) => name === current);

    SlotContainer.hideAllSlots(slotContainer);
    if (!hasSameName) {
      hideEditorContainer(editorCont);
      SlotContainer.showSlot(slotContainer, name);
    } else {
      showEditorContainer(editorCont);
    }
  });
};
