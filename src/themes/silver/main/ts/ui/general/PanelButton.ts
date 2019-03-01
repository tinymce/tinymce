/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloySpec,
  Behaviour,
  Dropdown as AlloyDropdown,
  RawDomSchema,
  SketchSpec,
  Unselecting,
  Tabstopping,
  AlloyComponent,
  LayoutTypes
} from '@ephox/alloy';
import { Future, Id, Option, Merger } from '@ephox/katamari';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

import * as MenuParts from '../menus/menu/MenuParts';
import { createTieredDataFrom, createPartialChoiceMenu } from 'tinymce/themes/silver/ui/menus/menu/SingleMenu';
import { deriveMenuMovement } from 'tinymce/themes/silver/ui/menus/menu/MenuMovement';
import { Element } from '@ephox/sugar';
import ItemResponse from '../menus/item/ItemResponse';

export interface SwatchPanelButtonFoo {
  dom: RawDomSchema;
  components: AlloySpec[];
  fetch: (callback: Function) => void;
  getHotspot?: (comp: AlloyComponent) => Option<AlloyComponent>;
  onItemAction: (value) => void;
  layouts?: Option<{
    onLtr: (elem: Element) => LayoutTypes.AnchorLayout[];
    onRtl: (elem: Element) => LayoutTypes.AnchorLayout[];
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
        return Option.from(createTieredDataFrom(
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
        ));
      });
    },

    parts: {
      menu: MenuParts.part(false, 1, 'color')
    }
  });
};