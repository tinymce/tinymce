import {
  AlloySpec,
  Behaviour,
  Dropdown as AlloyDropdown,
  RawDomSchema,
  SketchSpec,
  Unselecting,
  ComponentApi,
  Tabstopping
} from '@ephox/alloy';
import { Future, Id, Option, Merger } from '@ephox/katamari';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

import * as MenuParts from '../menus/menu/MenuParts';
import { createTieredDataFrom, createPartialChoiceMenu, SingleMenuItemApi } from 'tinymce/themes/silver/ui/menus/menu/SingleMenu';
import { ItemResponse } from 'tinymce/themes/silver/ui/menus/item/MenuItems';
import { deriveMenuMovement } from 'tinymce/themes/silver/ui/menus/menu/MenuMovement';
import { Element } from '@ephox/sugar';
import * as Layout from '@ephox/alloy/lib/main/ts/ephox/alloy/positioning/layout/Layout';

export interface PanelButtonFoo {
  dom: RawDomSchema;
  components: AlloySpec[];
  fetch: (callback: (panel: AlloySpec) => void) => void;
  getHotspot?: (comp: ComponentApi.AlloyComponent) => Option<ComponentApi.AlloyComponent>;
  onItemAction: (value) => void;
}

export interface SwatchPanelButtonFoo {
  dom: RawDomSchema;
  components: AlloySpec[];
  fetch: (callback: (panel: AlloySpec) => void) => void;
  getHotspot?: (comp: ComponentApi.AlloyComponent) => Option<ComponentApi.AlloyComponent>;
  onItemAction: (value) => void;
  items: SingleMenuItemApi[];
  layouts?: Option<{
    onLtr: (elem: Element) => Layout.AnchorLayout[];
    onRtl: (elem: Element) => Layout.AnchorLayout[];
  }>;
}

export const renderPanelButton = (spec: SwatchPanelButtonFoo, sharedBackstage: UiFactoryBackstageShared): SketchSpec => {
  return AlloyDropdown.sketch({
    dom: spec.dom,
    components: spec.components,

    toggleClass: 'mce-active',

    dropdownBehaviours: Behaviour.derive([
      Unselecting.config({ }),
      Tabstopping.config({ })
    ]),
    // getHotspot: spec.getHotspot,
    layouts: spec.layouts,
    sandboxClasses: [ 'tox-dialog__popups' ],

    lazySink: sharedBackstage.getSink,
    fetch () {

      return Future.pure(createTieredDataFrom(
        Merger.deepMerge(
          createPartialChoiceMenu(
            Id.generate('menu-value'),
            spec.items,
            (value) => {
              console.log('value', value);
              console.log(sharedBackstage);
              spec.onItemAction(value);
            },
            5, // spec.columns
            'color', // spec.presets,
            ItemResponse.CLOSE_ON_EXECUTE,
            // No colour is ever selected
            () => false,
            sharedBackstage.providers
          ),
          {
            movement: deriveMenuMovement(5, 'color')
          } // as PartialMenuSpec
        )
      ));
    },

    parts: {
      menu: MenuParts.part(false, 1, 'color')
    }
  });
};