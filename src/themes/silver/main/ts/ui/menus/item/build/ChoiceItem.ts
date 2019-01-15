/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Disabling, Toggling } from '@ephox/alloy';
import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { InlineContent, Menu, Types } from '@ephox/bridge';
import { Merger, Option } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import * as ItemClasses from '../ItemClasses';
import ItemResponse from '../ItemResponse';
import { renderCheckmark } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

// TODO: Remove dupe between these
const renderAutocompleteItem = (spec: InlineContent.AutocompleterItem, useText: boolean, presets: Types.PresetItemTypes, onItemValueHandler: (itemValue: string, itemMeta: Record<string, any>) => void, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {

  const structure = renderItemStructure({
    presets,
    textContent:  useText ? spec.text : Option.none(),
    ariaLabel: spec.text,
    iconContent: spec.icon,
    shortcutContent: Option.none(),
    checkMark: Option.none(),
    caret: Option.none(),
    value: spec.value
  }, providersBackstage, spec.icon);

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
  const getApi = (component): Menu.ToggleMenuItemInstanceApi => {
    return {
      setActive: (state) => {
        Toggling.set(component, state);
      },
      isActive: () => Toggling.isOn(component),
      isDisabled: () => Disabling.isDisabled(component),
      setDisabled: (state) => state ? Disabling.disable(component) : Disabling.enable(component)
    };
  };

  const structure = renderItemStructure({
    presets,
    textContent:  useText ? spec.text : Option.none(),
    ariaLabel: spec.text,
    iconContent: spec.icon,
    shortcutContent: useText ? spec.shortcut : Option.none(),

    // useText essentially says that we have one column. In one column lists, we should show a tick
    // The tick is controlled by the tickedClass (via css). It is always present
    // but is hidden unless the tickedClass is present.
    checkMark: useText ? Option.some(renderCheckmark(providersBackstage.icons)) : Option.none(),
    caret: Option.none(),
    value: spec.value
  }, providersBackstage);

  return Merger.deepMerge(
    renderCommonItem({
      data: buildData(spec),
      disabled: spec.disabled,
      getApi,
      onAction: (_api) => onItemValueHandler(spec.value),
      onSetup: (api) => {
        api.setActive(isSelected);
        return () => {};
      },
      triggersSubmenu: false,
      itemBehaviours: [ ]
    }, structure, itemResponse),
    {
      toggling: {
        toggleClass: ItemClasses.tickedClass,
        toggleOnExecute: false,
        selected: spec.active
      }
    }
  );
};

export { renderChoiceItem, renderAutocompleteItem };
