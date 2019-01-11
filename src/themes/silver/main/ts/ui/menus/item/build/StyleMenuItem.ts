/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { Menu } from '@ephox/bridge';
import { Merger } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import * as ItemClasses from '../ItemClasses';
import ItemResponse from '../ItemResponse';
import { renderCheckmark, renderIcon } from '../structure/ItemSlices';
import { renderStyleStructure } from '../structure/StyleStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

const renderStyleItem = (spec: Menu.ToggleMenuItem | Menu.MenuItem, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {
  const checkMark = spec.type === 'togglemenuitem' && spec.active ? renderCheckmark(providersBackstage.icons) : renderIcon('');

  const structure = renderStyleStructure(spec.text, spec.meta.style as any, checkMark);
  // const structure = renderItemStructure(spec, providersBackstage);

  return Merger.deepMerge(
    renderCommonItem({
      data: buildData(spec),
      disabled: spec.disabled,
      getApi: () => 10 as any,
      onAction: spec.onAction,
      onSetup: () => () => { },
      triggersSubmenu: false,
      itemBehaviours: [ ]
    }, structure, itemResponse),
    spec.type === 'togglemenuitem' ? {
      toggling: {
        toggleClass: ItemClasses.tickedClass,
        toggleOnExecute: false,
        selected: spec.active
      }
    } : { }
  );
};

export { renderStyleItem };