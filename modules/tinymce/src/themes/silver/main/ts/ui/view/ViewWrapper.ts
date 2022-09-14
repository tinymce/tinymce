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
        View.parts.header({
          buttons: internalViewConfig.buttons,
          providers
        }),
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

const runOnShow = (slotContainer: AlloyComponent, name: string) => {
  SlotContainer.getSlot(slotContainer, name).each((view) => {
    View.getPane(view).each((pane) => {
      const onShow = View.getOnShow(view);
      onShow(makeViewInstanceApi(pane.element.dom));
    });
  });
};

const runOnHide = (slotContainer: AlloyComponent, name: string) => {
  SlotContainer.getSlot(slotContainer, name).each((view) => {
    View.getPane(view).each((pane) => {
      const onHide = View.getOnHide(view);
      onHide(makeViewInstanceApi(pane.element.dom));
    });
  });
};

interface SilverViewWrapperSpec extends Sketcher.SingleSketchSpec {
  backstage: UiFactoryBackstage;
}

interface SilverViewWrapperDetail extends Sketcher.SingleSketchDetail {
  uid: string;
  backstage: UiFactoryBackstage;
}

interface SilverViewWrapperApis {
  setViews: (comp: AlloyComponent, viewConfigs: ViewConfig) => void;
  whichView: (comp: AlloyComponent) => Optional<string>;
  toggleView: (comp: AlloyComponent, editorCont: AlloyComponent, name: string) => void;
}

const factory: UiSketcher.SingleSketchFactory<SilverViewWrapperDetail, SilverViewWrapperSpec> = (detail, spec) => {
  const setViews = (comp: AlloyComponent, viewConfigs: ViewConfig) => {
    Replacing.set(comp, [ makeSlotContainer(viewConfigs, spec.backstage.shared.providers) ]);
  };

  const whichView = (comp: AlloyComponent): Optional<string> => {
    return Composing.getCurrent(comp).bind(getCurrentName);
  };

  const toggleView = (comp: AlloyComponent, editorCont: AlloyComponent, name: string): void => {
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
    toggleView: (apis, comp, editorCont, name) => apis.toggleView(comp, editorCont, name),
    whichView: (apis, comp) => apis.whichView(comp)
  }
});
