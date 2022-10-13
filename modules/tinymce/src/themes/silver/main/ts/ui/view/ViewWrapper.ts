import {
  AlloyComponent, AlloyEvents, Behaviour, Composing,
  Replacing, Sketcher, SlotContainer, SlotContainerTypes, UiSketcher
} from '@ephox/alloy';
import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { View as BridgeView } from '@ephox/bridge';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { Attribute, Css } from '@ephox/sugar';

import { UiFactoryBackstage, UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { SimpleBehaviours } from '../alien/SimpleBehaviours';
import View from './View';
import { ViewConfig } from './ViewTypes';

interface SilverViewWrapperSpec extends Sketcher.SingleSketchSpec {
  readonly backstage: UiFactoryBackstage;
}

interface SilverViewWrapperDetail extends Sketcher.SingleSketchDetail {
  readonly uid: string;
  readonly backstage: UiFactoryBackstage;
}

interface SilverViewWrapperApis {
  readonly setViews: (comp: AlloyComponent, viewConfigs: ViewConfig) => void;
  readonly whichView: (comp: AlloyComponent) => Optional<string>;
  readonly toggleView: (comp: AlloyComponent, showMainView: () => void, hideMainView: () => void, name: string) => boolean;
}

const makeViews = (parts: SlotContainerTypes.SlotContainerParts, viewConfigs: ViewConfig, providers: UiFactoryBackstageProviders) => {
  return Obj.mapToArray(viewConfigs, (config, name) => {
    const internalViewConfig: BridgeView.View = StructureSchema.getOrDie(BridgeView.createView(config));

    return parts.slot(name, View.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox-view' ]
      },
      viewConfig: internalViewConfig,
      components: [
        ...internalViewConfig.buttons.length > 0 ? [
          View.parts.header({
            buttons: internalViewConfig.buttons,
            providers
          })
        ] : [],
        View.parts.pane({})
      ]
    }));
  });
};

const makeSlotContainer = (viewConfigs: ViewConfig, providers: UiFactoryBackstageProviders) => SlotContainer.sketch((parts) => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-view-wrap__slot-container' ]
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

const runOnPaneWithInstanceApi = (slotContainer: AlloyComponent, name: string, get: (view: AlloyComponent) => (api: BridgeView.ViewInstanceApi) => void) => {
  SlotContainer.getSlot(slotContainer, name).each((view) => {
    View.getPane(view).each((pane) => {
      const onCallback = get(view);
      onCallback(makeViewInstanceApi(pane.element.dom));
    });
  });
};

const runOnShow = (slotContainer: AlloyComponent, name: string) => runOnPaneWithInstanceApi(slotContainer, name, View.getOnShow);
const runOnHide = (slotContainer: AlloyComponent, name: string) => runOnPaneWithInstanceApi(slotContainer, name, View.getOnHide);

const factory: UiSketcher.SingleSketchFactory<SilverViewWrapperDetail, SilverViewWrapperSpec> = (detail, spec) => {
  const setViews = (comp: AlloyComponent, viewConfigs: ViewConfig) => {
    Replacing.set(comp, [ makeSlotContainer(viewConfigs, spec.backstage.shared.providers) ]);
  };

  const whichView = (comp: AlloyComponent): Optional<string> => {
    return Composing.getCurrent(comp).bind(getCurrentName);
  };

  const toggleView = (comp: AlloyComponent, showMainView: () => void, hideMainView: () => void, name: string): boolean => {
    return Composing.getCurrent(comp).exists((slotContainer) => {
      const optCurrentSlotName = getCurrentName(slotContainer);
      const isTogglingCurrentView = optCurrentSlotName.exists((current) => name === current);
      const exists = SlotContainer.getSlot(slotContainer, name).isSome();

      if (exists) {
        SlotContainer.hideAllSlots(slotContainer);

        if (!isTogglingCurrentView) {
          hideMainView();
          showContainer(comp);
          SlotContainer.showSlot(slotContainer, name);
          runOnShow(slotContainer, name);
        } else {
          hideContainer(comp);
          showMainView();
        }

        optCurrentSlotName.each((prevName) => runOnHide(slotContainer, prevName));
      }

      return exists;
    });
  };

  const apis: SilverViewWrapperApis = {
    setViews,
    whichView,
    toggleView
  };

  return {
    uid: detail.uid,
    dom: {
      tag: 'div',
      classes: [ 'tox-view-wrap' ],
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
    ]),
    apis
  };
};

export default Sketcher.single<SilverViewWrapperSpec, SilverViewWrapperDetail, SilverViewWrapperApis>({
  factory,
  name: 'silver.ViewWrapper',
  configFields: [
    FieldSchema.required('backstage')
  ],
  apis: {
    setViews: (apis, comp, views) => apis.setViews(comp, views),
    toggleView: (apis, comp, outerContainer, editorCont, name) => apis.toggleView(comp, outerContainer, editorCont, name),
    whichView: (apis, comp) => apis.whichView(comp)
  }
});
