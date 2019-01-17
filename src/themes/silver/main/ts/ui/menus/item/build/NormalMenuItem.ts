/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Disabling } from '@ephox/alloy';
import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { Menu } from '@ephox/bridge';
import { Option } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import ItemResponse from '../ItemResponse';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

// Note, this does not create a valid SketchSpec.
const renderNormalItem = (spec: Menu.MenuItem, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {
  const getApi = (component): Menu.MenuItemInstanceApi => {
    return {
      isDisabled: () => Disabling.isDisabled(component),
      setDisabled: (state) => state ? Disabling.disable(component) : Disabling.enable(component)
    };
  };

  const structure = renderItemStructure({
    presets: 'normal',
    iconContent: spec.icon,
    textContent: spec.text,
    ariaLabel: spec.text,
    caret: Option.none(),
    checkMark: Option.none(),
    shortcutContent: spec.shortcut
  }, providersBackstage);

  return renderCommonItem({
    data: buildData(spec),
    getApi,
    disabled: spec.disabled,
    onAction: spec.onAction,
    onSetup: spec.onSetup,
    triggersSubmenu: false,
    itemBehaviours: [ ]
  }, structure, itemResponse);
};

export { renderNormalItem };
