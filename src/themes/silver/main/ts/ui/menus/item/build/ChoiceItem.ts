import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { InlineContent, Menu, Types } from '@ephox/bridge';
import { Option } from '@ephox/katamari';

import { ItemResponse } from '../MenuItems';
import { renderCheckmark } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

// TODO: Remove dupe between these
const renderAutocompleteItem = (spec: InlineContent.AutocompleterItem, useText: boolean, presets: Types.PresetItemTypes, onItemValueHandler: (itemValue: string, itemMeta: Record<string, any>) => void, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {
  const structure = renderItemStructure({
    presets,
    textContent:  useText ? spec.text : Option.none(),
    iconContent: spec.icon,
    shortcutContent: Option.none(),
    checkMark: Option.none(),
    caret: Option.none(),
    value: spec.value
  }, providersBackstage);

  return renderCommonItem({
    data: buildData(spec),
    disabled: spec.disabled,
    getApi: () => ({}),
    onAction: (_api) => onItemValueHandler(spec.value, spec.meta),
    onSetup: () => () => { },
    triggersSubmenu: false,
    itemBehaviours: [ ]
  }, structure, itemResponse);
};

const renderChoiceItem = (spec: Menu.ChoiceMenuItem, useText: boolean, presets: Types.PresetItemTypes, onItemValueHandler: (itemValue: string) => void, isSelected: boolean, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {
  const checkMark = (active) => active ? Option.some(renderCheckmark(providersBackstage.icons)) : Option.none();

  const structure = renderItemStructure({
    presets,
    textContent:  useText ? spec.text : Option.none(),
    iconContent: spec.icon,
    shortcutContent: useText ? spec.shortcut : Option.none(),
    checkMark: checkMark(isSelected),
    caret: Option.none(),
    value: spec.value
  }, providersBackstage);

  return renderCommonItem({
    data: buildData(spec),
    disabled: spec.disabled,
    getApi: () => 10 as any,
    onAction: (_api) => onItemValueHandler(spec.value),
    onSetup: () => () => { },
    triggersSubmenu: false,
    itemBehaviours: [ ]
  }, structure, itemResponse);
};

export { renderChoiceItem, renderAutocompleteItem };
