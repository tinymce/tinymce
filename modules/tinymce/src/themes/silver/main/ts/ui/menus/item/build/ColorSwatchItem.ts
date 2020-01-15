/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ItemTypes, ItemWidget, Menu as AlloyMenu, MenuTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Id } from '@ephox/katamari';

import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import ColorSwatch from 'tinymce/themes/silver/ui/core/color/ColorSwatch';
import { createPartialChoiceMenu } from '../../menu/MenuChoice';
import { deriveMenuMovement } from '../../menu/MenuMovement';
import * as MenuParts from '../../menu/MenuParts';
import ItemResponse from '../ItemResponse';

export function renderColorSwatchItem(spec: Menu.FancyMenuItem, backstage: UiFactoryBackstage): ItemTypes.WidgetItemSpec {
  const items = ColorSwatch.getColors(backstage.colorinput.getColors(), backstage.colorinput.hasCustomColors());
  const columns = backstage.colorinput.getColorCols();
  const presets = 'color';

  const menuSpec = createPartialChoiceMenu(
    Id.generate('menu-value'),
    items,
    (value) => {
      spec.onAction({ value });
    },
    columns,
    presets,
    ItemResponse.CLOSE_ON_EXECUTE,
    () => false,
    backstage.shared.providers
  );

  const widgetSpec: MenuTypes.MenuSpec = {
    ...menuSpec,
    markers: MenuParts.markers(presets),
    movement: deriveMenuMovement(columns, presets)
  };

  return {
    type: 'widget',
    data: { value: Id.generate('widget-id')},
    dom: {
      tag: 'div',
      classes: [ 'tox-fancymenuitem' ],
    },
    autofocus: true,
    components: [
      ItemWidget.parts().widget(AlloyMenu.sketch(widgetSpec))
    ]
  };
}
