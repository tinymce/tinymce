/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent, AlloySpec, Behaviour, Dropdown as AlloyDropdown, Layouts, RawDomSchema, SketchSpec, Tabstopping, Unselecting
} from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Future, Id, Merger, Option } from '@ephox/katamari';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import ItemResponse from '../menus/item/ItemResponse';
import { createPartialChoiceMenu } from '../menus/menu/MenuChoice';
import { deriveMenuMovement } from '../menus/menu/MenuMovement';

import * as MenuParts from '../menus/menu/MenuParts';
import { createTieredDataFrom } from '../menus/menu/SingleMenu';

export interface SwatchPanelButtonSpec {
  dom: RawDomSchema;
  components: AlloySpec[];
  fetch: (callback: Function) => void;
  columns: number;
  presets: Types.PresetTypes;
  getHotspot?: (comp: AlloyComponent) => Option<AlloyComponent>;
  onItemAction: (comp: AlloyComponent, value) => void;
  layouts?: Layouts;
}

export const renderPanelButton = (spec: SwatchPanelButtonSpec, sharedBackstage: UiFactoryBackstageShared): SketchSpec => AlloyDropdown.sketch({
  dom: spec.dom,
  components: spec.components,

  toggleClass: 'mce-active',

  dropdownBehaviours: Behaviour.derive([
    DisablingConfigs.button(sharedBackstage.providers.isReadOnly),
    ReadOnly.receivingConfig(),
    Unselecting.config({}),
    Tabstopping.config({})
  ]),
  layouts: spec.layouts,
  sandboxClasses: [ 'tox-dialog__popups' ],

  lazySink: sharedBackstage.getSink,
  fetch: (comp) => Future.nu((callback) => spec.fetch(callback)).map((items) => Option.from(createTieredDataFrom(
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
  ))),

  parts: {
    menu: MenuParts.part(false, 1, spec.presets)
  }
});
