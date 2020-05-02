/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Disabling, Toggling } from '@ephox/alloy';
import { Menu, Types } from '@ephox/bridge';
import { Merger, Option } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import * as ItemClasses from '../ItemClasses';
import ItemResponse from '../ItemResponse';
import { renderCheckmark } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

const renderChoiceItem = (
  spec: Menu.ChoiceMenuItem,
  useText: boolean,
  presets: Types.PresetItemTypes,
  onItemValueHandler: (itemValue: string) => void,
  isSelected: boolean, itemResponse: ItemResponse,
  providersBackstage: UiFactoryBackstageProviders,
  renderIcons: boolean = true
) => {
  const getApi = (component): Menu.ToggleMenuItemInstanceApi => ({
    setActive: (state) => {
      Toggling.set(component, state);
    },
    isActive: () => Toggling.isOn(component),
    isDisabled: () => Disabling.isDisabled(component),
    setDisabled: (state: boolean) => Disabling.set(component, state)
  });

  const structure = renderItemStructure({
    presets,
    textContent:  useText ? spec.text : Option.none(),
    htmlContent: Option.none(),
    ariaLabel: spec.text,
    iconContent: spec.icon,
    shortcutContent: useText ? spec.shortcut : Option.none(),

    // useText essentially says that we have one column. In one column lists, we should show a tick
    // The tick is controlled by the tickedClass (via css). It is always present
    // but is hidden unless the tickedClass is present.
    checkMark: useText ? Option.some(renderCheckmark(providersBackstage.icons)) : Option.none(),
    caret: Option.none(),
    value: spec.value
  }, providersBackstage, renderIcons);

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
    }, structure, itemResponse, providersBackstage),
    {
      toggling: {
        toggleClass: ItemClasses.tickedClass,
        toggleOnExecute: false,
        selected: spec.active
      }
    }
  );
};

export { renderChoiceItem };
