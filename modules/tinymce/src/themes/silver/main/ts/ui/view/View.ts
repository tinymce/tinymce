import {
  AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Button, Composing,
  Composite, GuiFactory, PartType, RawDomSchema, Replacing, SimpleSpec,
  Sketcher, SketchSpec, SlotContainer, SlotContainerTypes, UiSketcher
} from '@ephox/alloy';
import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { View as BridgeView } from '@ephox/bridge';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
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

export interface ViewToolbarSpec extends SimpleSpec {
  buttons: BridgeView.ViewButton[];
}

const renderViewButton = (spec: BridgeView.ViewButton) => {
  // TODO: Use `renderButtonSpec` the backstage needs to be passed along
  return Button.sketch({
    dom: {
      tag: 'button',
      classes: [ 'tox-button', 'tox-button--secondary' ]
    },
    components: [ GuiFactory.text(spec.text) ],
    action: (_comp) => spec.onAction()
  });
};

const renderViewToolbar = (spec: ViewToolbarSpec) => {
  return {
    uid: spec.uid,
    dom: {
      tag: 'div',
      innerHtml: 'code'
    },
    components: Arr.map(spec.buttons, renderViewButton)
  };
};

const renderViewSlot = (spec: SimpleSpec) => {
  return {
    uid: spec.uid,
    dom: {
      tag: 'div',
      innerHtml: 'slot'
    }
  };
};

export interface ViewSketchSpec extends Sketcher.CompositeSketchSpec {
  readonly dom: RawDomSchema;
  readonly components: AlloySpec[];
  readonly viewConfig: BridgeView.View;
}

export interface ViewDetail extends Sketcher.CompositeSketchDetail {
  readonly uid: string;
  readonly dom: RawDomSchema;
  readonly components: AlloySpec[ ];
  readonly viewConfig: BridgeView.View;
}

interface ViewApis {
  readonly getToolbar: (comp: AlloyComponent) => Optional<AlloyComponent>;
  readonly getSlot: (comp: AlloyComponent) => Optional<AlloyComponent>;
  readonly getOnShow: (comp: AlloyComponent) => (api: BridgeView.ViewInstanceApi) => void;
  readonly getOnHide: (comp: AlloyComponent) => (api: BridgeView.ViewInstanceApi) => void;
}

const factory: UiSketcher.CompositeSketchFactory<ViewDetail, ViewSketchSpec> = (detail, components, _spec, _externals) => {
  const apis: ViewApis = {
    getToolbar: (comp) => {
      return Composite.parts.getPart(comp, detail, 'toolbar');
    },
    getSlot: (comp) => {
      return Composite.parts.getPart(comp, detail, 'slot');
    },
    getOnShow: (_comp) => detail.viewConfig.onShow,
    getOnHide: (_comp) => detail.viewConfig.onHide,
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    apis
  };
};

const CustomView = Sketcher.composite<ViewSketchSpec, ViewDetail, ViewApis>({
  name: 'CustomView',
  configFields: [
    FieldSchema.required('viewConfig'),
  ],
  partFields: [
    PartType.optional({
      factory: {
        sketch: renderViewToolbar
      },
      schema: [
        FieldSchema.required('buttons')
      ],
      name: 'toolbar'
    }),
    PartType.optional({
      factory: {
        sketch: renderViewSlot
      },
      schema: [],
      name: 'slot'
    })
  ],
  factory,
  apis: {
    getToolbar: (apis, comp) => apis.getToolbar(comp),
    getSlot: (apis, comp) => apis.getSlot(comp),
    getOnShow: (apis, comp) => apis.getOnShow(comp),
    getOnHide: (apis, comp) => apis.getOnHide(comp)
  }
});

const makeViews = (parts: SlotContainerTypes.SlotContainerParts, viewConfigs: ViewConfig) => {
  return Obj.mapToArray(viewConfigs, (config, name) => {
    const internalViewConfig: BridgeView.View = StructureSchema.getOrDie(BridgeView.createView(config));

    return parts.slot(name, CustomView.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox-custom-view' ]
      },
      viewConfig: internalViewConfig,
      components: [
        CustomView.parts.toolbar({
          buttons: internalViewConfig.buttons
        }),
        CustomView.parts.slot({})
      ]
    }));
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

const makeViewInstanceApi = (slot: HTMLElement): BridgeView.ViewInstanceApi => ({
  getContainer: Fun.constant(slot)
});

const runOnShow = (slotContainer: AlloyComponent, name: string) => {
  SlotContainer.getSlot(slotContainer, name).each((view) => {
    CustomView.getSlot(view).each((slot) => {
      const onShow = CustomView.getOnShow(view);
      onShow(makeViewInstanceApi(slot.element.dom));
    });
  });
};

const runOnHide = (slotContainer: AlloyComponent, name: string) => {
  SlotContainer.getSlot(slotContainer, name).each((view) => {
    CustomView.getSlot(view).each((slot) => {
      const onHide = CustomView.getOnHide(view);
      onHide(makeViewInstanceApi(slot.element.dom));
    });
  });
};

export const setViews = (comp: AlloyComponent, viewConfigs: ViewConfig): void => {
  Replacing.set(comp, [ makeSlotContainer(viewConfigs) ]);
};

export const whichView = (comp: AlloyComponent): Optional<string> => {
  return Composing.getCurrent(comp).bind(getCurrentName);
};

export const toggleView = (comp: AlloyComponent, editorCont: AlloyComponent, name: string): void => {
  Composing.getCurrent(comp).each((slotContainer) => {
    const optCurrentSlotName = getCurrentName(slotContainer);
    const hasSameName = optCurrentSlotName.exists((current) => name === current);

    // TODO: Clean this mess up onShow/onHide should fire when toggling on/off current and toggling to something different even if doesn't exist or noop that
    optCurrentSlotName.each((prevName) => runOnHide(slotContainer, prevName));
    SlotContainer.hideAllSlots(slotContainer);
    if (!hasSameName) {
      hideEditorContainer(editorCont);
      SlotContainer.showSlot(slotContainer, name);
      runOnShow(slotContainer, name);
    } else {
      showEditorContainer(editorCont);
    }
  });
};
