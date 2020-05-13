/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Disabling, Toggling, ItemTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Merger, Option } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import * as ItemClasses from '../ItemClasses';
import ItemResponse from '../ItemResponse';
import { renderCheckmark } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

const renderToggleMenuItem = (
  spec: Menu.ToggleMenuItem,
  itemResponse: ItemResponse,
  providersBackstage: UiFactoryBackstageProviders,
  renderIcons: boolean = true
): ItemTypes.ItemSpec => {
  const getApi = (component): Menu.ToggleMenuItemInstanceApi => ({
    setActive: (state) => {
      Toggling.set(component, state);
    },
    isActive: () => Toggling.isOn(component),
    isDisabled: () => Disabling.isDisabled(component),
    setDisabled: (state: boolean) => Disabling.set(component, state)
  });

  // BespokeSelects use meta to pass through styling information. Bespokes should only
  // be togglemenuitems hence meta is only passed through in this MenuItem.
  const structure = renderItemStructure({
    iconContent: spec.icon,
    textContent: spec.text,
    htmlContent: Option.none(),
    ariaLabel: spec.text,
    checkMark: Option.some(renderCheckmark(providersBackstage.icons)),
    caret: Option.none(),
    shortcutContent: spec.shortcut,
    presets: 'normal',
    meta: spec.meta
  }, providersBackstage, renderIcons);

  return Merger.deepMerge(
    renderCommonItem({
      data: buildData(spec),
      disabled: spec.disabled,
      getApi,
      onAction: spec.onAction,
      onSetup: spec.onSetup,
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

export { renderToggleMenuItem };
