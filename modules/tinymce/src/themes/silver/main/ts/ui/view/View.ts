import {
  AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Composing,
  Composite, Container, PartType, RawDomSchema, Replacing, SimpleSpec,
  Sketcher, SketchSpec, SlotContainer, SlotContainerTypes, UiSketcher
} from '@ephox/alloy';
import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { View as BridgeView } from '@ephox/bridge';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { Attribute, Css } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { SimpleBehaviours } from '../alien/SimpleBehaviours';
import { renderButton } from '../general/Button';

export type ViewConfig = Record<string, BridgeView.ViewSpec>;

export const renderCustomViewWrapper = (spec: SketchSpec): AlloySpec => ({
  uid: spec.uid,
  dom: {
    tag: 'div',
    classes: [ 'tox-custom-view-wrap' ],
    attributes: { 'aria-hidden': 'true' },
    styles: { display: 'none' }
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

export interface ViewHeaderSpec extends SimpleSpec {
  buttons: BridgeView.ViewButton[];
  providers: UiFactoryBackstageProviders;
}

const renderViewButton = (spec: BridgeView.ViewButton, providers: UiFactoryBackstageProviders) => {
  return renderButton(
    {
      text: spec.text,
      enabled: true,
      primary: false,
      name: 'name',
      icon: Optional.none(),
      borderless: false,
      buttonType: Optional.some(spec.buttonType)
    },
    (_comp) => {
      spec.onAction();
    },
    providers
  );
};

const renderViewHeader = (spec: ViewHeaderSpec) => {
  const endButtons = Arr.map(spec.buttons, (btnspec) => renderViewButton(btnspec, spec.providers));

  return {
    uid: spec.uid,
    dom: {
      tag: 'div',
      classes: [ 'tox-custom-view__header' ]
    },
    components: [
      Container.sketch({
        dom: {
          tag: 'div',
          classes: [ 'tox-custom-view__header-start' ]
        },
        components: []
      }),
      Container.sketch({
        dom: {
          tag: 'div',
          classes: [ 'tox-custom-view__header-end' ]
        },
        components: endButtons
      })
    ]
  };
};

const renderViewPane = (spec: SimpleSpec) => {
  return {
    uid: spec.uid,
    dom: {
      tag: 'div',
      classes: [ 'tox-custom-view__pane' ]
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
  readonly getPane: (comp: AlloyComponent) => Optional<AlloyComponent>;
  readonly getOnShow: (comp: AlloyComponent) => (api: BridgeView.ViewInstanceApi) => void;
  readonly getOnHide: (comp: AlloyComponent) => (api: BridgeView.ViewInstanceApi) => void;
}

const factory: UiSketcher.CompositeSketchFactory<ViewDetail, ViewSketchSpec> = (detail, components, _spec, _externals) => {
  const apis: ViewApis = {
    getPane: (comp) => Composite.parts.getPart(comp, detail, 'pane'),
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
        sketch: renderViewHeader
      },
      schema: [
        FieldSchema.required('buttons'),
        FieldSchema.required('providers')
      ],
      name: 'header'
    }),
    PartType.optional({
      factory: {
        sketch: renderViewPane
      },
      schema: [],
      name: 'pane'
    })
  ],
  factory,
  apis: {
    getPane: (apis, comp) => apis.getPane(comp),
    getOnShow: (apis, comp) => apis.getOnShow(comp),
    getOnHide: (apis, comp) => apis.getOnHide(comp)
  }
});

const makeViews = (parts: SlotContainerTypes.SlotContainerParts, viewConfigs: ViewConfig, providers: UiFactoryBackstageProviders) => {
  return Obj.mapToArray(viewConfigs, (config, name) => {
    const internalViewConfig: BridgeView.View = StructureSchema.getOrDie(BridgeView.createView(config));

    return parts.slot(name, CustomView.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox-custom-view' ]
      },
      viewConfig: internalViewConfig,
      components: [
        CustomView.parts.header({
          buttons: internalViewConfig.buttons,
          providers
        }),
        CustomView.parts.pane({})
      ]
    }));
  });
};

const makeSlotContainer = (viewConfigs: ViewConfig, providers: UiFactoryBackstageProviders) => SlotContainer.sketch((parts) => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-custom-view-wrap__slot-container' ]
  },
  components: makeViews(parts, viewConfigs, providers),
  slotBehaviours: SimpleBehaviours.unnamedEvents([
    AlloyEvents.runOnAttached((slotContainer) => SlotContainer.hideAllSlots(slotContainer))
  ])
}));

const getCurrentName = (slotContainer: AlloyComponent) => {
  return Arr.find(SlotContainer.getSlotNames(slotContainer), (name) =>
    SlotContainer.isShowing(slotContainer, name)
  );
};

const hideContainer = (comp: AlloyComponent) => {
  const element = comp.element;
  Css.set(element, 'display', 'none');
  Attribute.set(element, 'aria-hidden', 'true');
};

const showContainer = (comp: AlloyComponent) => {
  const element = comp.element;
  Css.remove(element, 'display');
  Attribute.remove(element, 'aria-hidden');
};

const makeViewInstanceApi = (slot: HTMLElement): BridgeView.ViewInstanceApi => ({
  getContainer: Fun.constant(slot)
});

const runOnShow = (slotContainer: AlloyComponent, name: string) => {
  SlotContainer.getSlot(slotContainer, name).each((view) => {
    CustomView.getPane(view).each((pane) => {
      const onShow = CustomView.getOnShow(view);
      onShow(makeViewInstanceApi(pane.element.dom));
    });
  });
};

const runOnHide = (slotContainer: AlloyComponent, name: string) => {
  SlotContainer.getSlot(slotContainer, name).each((view) => {
    CustomView.getPane(view).each((pane) => {
      const onHide = CustomView.getOnHide(view);
      onHide(makeViewInstanceApi(pane.element.dom));
    });
  });
};

export const setViews = (comp: AlloyComponent, viewConfigs: ViewConfig, providers: UiFactoryBackstageProviders): void => {
  Replacing.set(comp, [ makeSlotContainer(viewConfigs, providers) ]);
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
      hideContainer(editorCont);
      showContainer(comp);
      SlotContainer.showSlot(slotContainer, name);
      runOnShow(slotContainer, name);
    } else {
      hideContainer(comp);
      showContainer(editorCont);
    }
  });
};
