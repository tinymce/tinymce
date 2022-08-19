import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Button, Focusing, ItemTypes, NativeEvents, Replacing
} from '@ephox/alloy';
import { Cell, Fun, Optional, Optionals } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import * as ReadOnly from 'tinymce/themes/silver/ReadOnly';
import { DisablingConfigs } from 'tinymce/themes/silver/ui/alien/DisablingConfigs';
import { onControlAttached, onControlDetached, OnDestroy } from 'tinymce/themes/silver/ui/controls/Controls';

import { menuItemEventOrder, onMenuItemExecute } from '../ItemEvents';
import ItemResponse from '../ItemResponse';
import { ItemStructure } from '../structure/ItemStructure';

export interface ItemDataInput {
  readonly value: string;
  readonly text: Optional<string>;
  readonly meta: Record<string, any>;
}

export type ItemDataOutput = ItemTypes.NormalItemSpec['data'];

export interface CommonMenuItemSpec<T> {
  readonly onAction: (itemApi: T) => void;
  readonly onSetup: (itemApi: T) => OnDestroy<T>;
  readonly triggersSubmenu: boolean;
  readonly enabled: boolean;
  readonly itemBehaviours: Behaviour.NamedConfiguredBehaviour<any, any, any>[];
  readonly getApi: (comp: AlloyComponent) => T;
  readonly data: ItemDataOutput;
}

export interface CommonCollectionItemSpec {
  readonly onAction: () => void;
  readonly disabled: boolean;
}

export const componentRenderPipeline: (xs: Array<Optional<AlloySpec>>) => AlloySpec[] = Optionals.cat;

const renderCommonItem = <T>(spec: CommonMenuItemSpec<T>, structure: ItemStructure, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemTypes.ItemSpec => {
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
        DisablingConfigs.item(() => !spec.enabled || providersBackstage.isDisabled()),
        ReadOnly.receivingConfig(),
        Replacing.config({ })
      ].concat(spec.itemBehaviours)
    )
  };
};

// This is not the ideal place for this code. We really want to
// be doing a bit more code reuse. This render is different
// from other renders because it is used for rendering a component
// inside a dialog, not inside a menu. That's basically the reason
// for the differences here.
const renderCommonChoice = (spec: CommonCollectionItemSpec, structure: ItemStructure, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): AlloySpec =>
  Button.sketch({
    dom: structure.dom,
    components: componentRenderPipeline(structure.optComponents),
    eventOrder: menuItemEventOrder,
    buttonBehaviours: Behaviour.derive(
      [
        AddEventsBehaviour.config('item-events', [
          AlloyEvents.run(NativeEvents.mouseover(), Focusing.focus)
        ]),
        DisablingConfigs.item(() => spec.disabled || providersBackstage.isDisabled()),
        ReadOnly.receivingConfig()
      ]
    ),
    action: spec.onAction
  });

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
