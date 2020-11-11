/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Button, Focusing, ItemTypes, NativeEvents, Replacing
} from '@ephox/alloy';
import { Arr, Cell, Fun, Optional } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import * as ReadOnly from 'tinymce/themes/silver/ReadOnly';

import { DisablingConfigs } from 'tinymce/themes/silver/ui/alien/DisablingConfigs';
import { onControlAttached, onControlDetached, OnDestroy } from 'tinymce/themes/silver/ui/controls/Controls';
import { menuItemEventOrder, onMenuItemExecute } from '../ItemEvents';
import ItemResponse from '../ItemResponse';
import { ItemStructure } from '../structure/ItemStructure';

export const componentRenderPipeline = (xs: Array<Optional<AlloySpec>>) =>
  Arr.bind(xs, (o) => o.toArray());

export interface CommonMenuItemSpec<T> {
  onAction: (itemApi: T) => void;
  onSetup: (itemApi: T) => OnDestroy<T>;
  triggersSubmenu: boolean;
  disabled: boolean;
  itemBehaviours: Array<Behaviour.NamedConfiguredBehaviour<Behaviour.BehaviourConfigSpec, Behaviour.BehaviourConfigDetail>>;
  getApi: (comp: AlloyComponent) => T;
  data: ItemDataOutput;
}

const renderCommonItem = <T>(spec: CommonMenuItemSpec<T>, structure: ItemStructure, itemResponse: ItemResponse, providersbackstage: UiFactoryBackstageProviders): ItemTypes.ItemSpec => {
  const editorOffCell = Cell(Fun.noop);

  return {
    type: 'item',
    dom: structure.dom,
    components: componentRenderPipeline(structure.optComponents),
    data: spec.data,
    eventOrder: menuItemEventOrder,
    hasSubmenu: spec.triggersSubmenu,
    itemBehaviours: Behaviour.derive(
      [
        AddEventsBehaviour.config('item-events', [
          onMenuItemExecute(spec, itemResponse),
          onControlAttached(spec, editorOffCell),
          onControlDetached(spec, editorOffCell)
        ]),
        DisablingConfigs.item(() => spec.disabled || providersbackstage.isDisabled()),
        ReadOnly.receivingConfig(),
        Replacing.config({ })
      ].concat(spec.itemBehaviours)
    )
  };
};

export interface CommonCollectionItemSpec {
  onAction: () => void;
  disabled: boolean;
}

// This is not the ideal place for this code. We really want to
// be doing a bit more code reuse. This render is different
// from other renders because it is used for rendering a component
// inside a dialog, not inside a menu. That's basically the reason
// for the differences here.
const renderCommonChoice = (spec: CommonCollectionItemSpec, structure: ItemStructure, itemResponse: ItemResponse, providersbackstage: UiFactoryBackstageProviders): AlloySpec => Button.sketch({
  dom: structure.dom,
  components: componentRenderPipeline(structure.optComponents),
  eventOrder: menuItemEventOrder,
  buttonBehaviours: Behaviour.derive(
    [
      AddEventsBehaviour.config('item-events', [
        AlloyEvents.run(NativeEvents.mouseover(), Focusing.focus)
      ]),
      DisablingConfigs.item(() => spec.disabled || providersbackstage.isDisabled()),
      ReadOnly.receivingConfig()
    ]
  ),
  action: spec.onAction
});

export interface ItemDataInput {
  value: string;
  text: Optional<string>;
  meta: Record<string, any>;
}

export type ItemDataOutput = ItemTypes.NormalItemSpec['data'];

const buildData = (source: ItemDataInput): ItemDataOutput => ({
  value: source.value,
  meta: {
    text: source.text.getOr(''),
    ...source.meta
  }
});

export {
  buildData,
  renderCommonItem,
  renderCommonChoice
};
