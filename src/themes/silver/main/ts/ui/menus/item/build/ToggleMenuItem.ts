/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { Disabling, Toggling } from '@ephox/alloy';
import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { Menu } from '@ephox/bridge';
import { Merger, Option, Obj } from '@ephox/katamari';

import * as ItemClasses from '../ItemClasses';
import { buildData, renderCommonItem } from './CommonMenuItem';
import { renderItemStructure } from '../structure/ItemStructure';
import { renderCheckmark } from '../structure/ItemSlices';
import ItemResponse from '../ItemResponse';

const renderToggleMenuItem = (spec: Menu.ToggleMenuItem, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {
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
    iconContent: Option.none(),
    textContent: spec.text,
    ariaLabel: spec.text,
    checkMark: Option.some(renderCheckmark(providersBackstage.icons)),
    caret: Option.none(),
    shortcutContent: spec.shortcut,
    presets: 'normal',
    ...spec.meta && Obj.keys(spec.meta).length > 0 ? { meta: spec.meta } : {}
  }, providersBackstage);

  return Merger.deepMerge(
    renderCommonItem({
      data: buildData(spec),
      disabled: spec.disabled,
      getApi,
      onAction: spec.onAction,
      onSetup: spec.onSetup,
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

export {
  renderToggleMenuItem
};
