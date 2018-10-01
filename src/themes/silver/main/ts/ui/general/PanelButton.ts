import {
  AlloySpec,
  Behaviour,
  Dropdown as AlloyDropdown,
  RawDomSchema,
  SketchSpec,
  TieredMenu,
  Unselecting,
  AddEventsBehaviour,
  AlloyEvents,
  CustomEvent,
  SimulatedEvent,
  ComponentApi,
  Tabstopping
} from '@ephox/alloy';
import { Future, Id, Option } from '@ephox/katamari';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

import * as MenuParts from '../menus/menu/MenuParts';
import { renderWidgetMenu } from '../menus/menu/MenuWidgets';
import { formActionEvent } from '../general/FormEvents';

export interface PanelButtonFoo {
  dom: RawDomSchema;
  components: AlloySpec[];
  fetch: (callback: (panel: AlloySpec) => void) => void;
  getHotspot?: (comp: ComponentApi.AlloyComponent) => Option<ComponentApi.AlloyComponent>;
  onChange: (comp: ComponentApi.AlloyComponent, se: SimulatedEvent<CustomEvent>) => void;
}

export const renderPanelButton = (spec: PanelButtonFoo, sharedBackstage: UiFactoryBackstageShared): SketchSpec => {
  return AlloyDropdown.sketch({
    dom: spec.dom,
    components: spec.components,

    toggleClass: 'mce-active',

    dropdownBehaviours: Behaviour.derive([
      Unselecting.config({ }),
      Tabstopping.config({ })
    ]),
    getHotspot: spec.getHotspot,
    sandboxClasses: [ 'tox-dialog__popups' ],
    sandboxBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('sandbox-behaviours-dropdown', [
        AlloyEvents.run(formActionEvent, spec.onChange)
      ])
    ]),

    lazySink: sharedBackstage.getSink,
    fetch () {
      const menuName = Id.generate('menu');
      return Future.nu((callback) => {
        spec.fetch((panel) => {
          callback(
            TieredMenu.singleData(
              menuName,
              renderWidgetMenu({
                value: menuName,
                widget: panel
              })
            )
          );
        });
      });
    },

    parts: {
      menu: MenuParts.part(false, 1, 'normal')
    }
  });
};