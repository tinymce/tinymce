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
import { Types } from '@ephox/bridge';
import { Future, Id, Option, Merger } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

import * as MenuParts from '../menus/menu/MenuParts';
import { createTieredDataFrom } from '../menus/menu/SingleMenu';
import { createPartialChoiceMenu } from '../menus/menu/MenuChoice';
import { deriveMenuMovement } from '../menus/menu/MenuMovement';
import ItemResponse from '../menus/item/ItemResponse';

export interface SwatchPanelButtonSpec {
  dom: RawDomSchema;
  components: AlloySpec[];
  fetch: (callback: Function) => void;
  columns: number;
  presets: Types.PresetTypes;
  getHotspot?: (comp: AlloyComponent) => Option<AlloyComponent>;
  onItemAction: (comp: AlloyComponent, value) => void;
  layouts?: Option<{
    onLtr: (elem: Element) => LayoutTypes.AnchorLayout[];
    onRtl: (elem: Element) => LayoutTypes.AnchorLayout[];
  }>;
}

export const renderPanelButton = (spec: SwatchPanelButtonSpec, sharedBackstage: UiFactoryBackstageShared): SketchSpec => {
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
    fetch: (comp) => {
      return Future.nu((callback) => {
        return spec.fetch(callback);
      }).map((items) => {
        return Option.from(createTieredDataFrom(
          Merger.deepMerge(
            createPartialChoiceMenu(
              Id.generate('menu-value'),
              items,
              (value) => {
                spec.onItemAction(comp, value);
              },
              spec.columns,
              spec.presets,
              ItemResponse.CLOSE_ON_EXECUTE,
              // No colour is ever selected on opening
              () => false,
              sharedBackstage.providers
            ),
            {
              movement: deriveMenuMovement(spec.columns, spec.presets)
            }
          )
        ));
      });
    },

    parts: {
      menu: MenuParts.part(false, 1, spec.presets)
    }
  });
};