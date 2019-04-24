/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import { ItemTypes, ItemWidget, Menu as AlloyMenu } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Id } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { deriveMenuMovement } from '../../menu/MenuMovement';
import * as MenuParts from '../../menu/MenuParts';
import { createPartialChoiceMenu } from '../../menu/SingleMenu';
import ItemResponse from '../ItemResponse';

export function renderColorSwatchItem(spec: Menu.FancyMenuItem, providersBackstage: UiFactoryBackstageProviders): ItemTypes.WidgetItemSpec {
  // TODO: Probably find a better place to put this.
  const items = providersBackstage.colors();

  // TODO: Where should this come from?
  const columns = 5;
  const presets = 'color';

  const menuSpec = createPartialChoiceMenu(
    Id.generate('menu-value'),
    items,
    (value) => {
      spec.onAction(value);
    },
    columns,
    presets,
    ItemResponse.CLOSE_ON_EXECUTE,
    () => false,
    providersBackstage
  );

  return {
    type: 'widget',
    data: { value: Id.generate('widget-id')},
    dom: {
      tag: 'div',
      classes: ['tox-fancymenuitem'],
    },
    autofocus: true,
    components: [ItemWidget.parts().widget(
      AlloyMenu.sketch({
        ...menuSpec,
        markers: MenuParts.markers('color'),
        movement: deriveMenuMovement(columns, presets)
      } as any)
    )]
  };
}