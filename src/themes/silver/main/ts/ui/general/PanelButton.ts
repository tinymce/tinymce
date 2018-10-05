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
import { createTieredDataFrom, createPartialChoiceMenu } from 'tinymce/themes/silver/ui/menus/menu/SingleMenu';
import { ItemResponse } from 'tinymce/themes/silver/ui/menus/item/MenuItems';
import { deriveMenuMovement } from 'tinymce/themes/silver/ui/menus/menu/MenuMovement';
import { Element } from '@ephox/sugar';
import * as Layout from '@ephox/alloy/lib/main/ts/ephox/alloy/positioning/layout/Layout';

export interface SwatchPanelButtonFoo {
  dom: RawDomSchema;
  components: AlloySpec[];
  fetch: (callback: Function) => void;
  getHotspot?: (comp: ComponentApi.AlloyComponent) => Option<ComponentApi.AlloyComponent>;
  onItemAction: (value) => void;
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
      Unselecting.config({}),
      Tabstopping.config({})
    ]),
    // getHotspot: spec.getHotspot,
    layouts: spec.layouts,
    sandboxClasses: ['tox-dialog__popups'],

    lazySink: sharedBackstage.getSink,
    fetch: () => {
      return Future.nu((callback) => {
        return spec.fetch(callback);
      }).map((items) => {
        return createTieredDataFrom(
          Merger.deepMerge(
            createPartialChoiceMenu(
              Id.generate('menu-value'),
              items,
              (value) => {
                spec.onItemAction(value);
              },
              5,
              'color',
              ItemResponse.CLOSE_ON_EXECUTE,
              // No colour is ever selected on opening
              () => false,
              sharedBackstage.providers
            ),
            {
              movement: deriveMenuMovement(5, 'color')
            }
          )
        );
      });
    },

    parts: {
      menu: MenuParts.part(false, 1, 'color')
    }
  });
};