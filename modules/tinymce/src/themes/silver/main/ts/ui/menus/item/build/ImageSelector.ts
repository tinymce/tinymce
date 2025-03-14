import { Menu as AlloyMenu, ItemTypes, ItemWidget, MenuTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Fun, Id, Obj, Type } from '@ephox/katamari';

import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { createPartialChoiceMenu } from '../../menu/MenuChoice';
import { deriveMenuMovement } from '../../menu/MenuMovement';
import * as MenuParts from '../../menu/MenuParts';
import ItemResponse from '../ItemResponse';

const isImageMenuItem = (item: any): item is Menu.ImageMenuItemSpec => Type.isObject(item) && Obj.has(item, 'tooltip');

const renderImageSelector = (spec: Menu.ImageSelectMenuItem, backstage: UiFactoryBackstage): ItemTypes.WidgetItemSpec => {
  const presets = 'listpreview';
  const columns = spec.initData.columns;
  const menuSpec = createPartialChoiceMenu(
    Id.generate('menu-value'),
    // TODO: should we directly use text?
    spec.initData.items.map((i) => ({ ...i, text: isImageMenuItem(i) ? i.tooltip : i.text })),
    (value) => {
      spec.onAction({ value });
    },
    columns,
    presets,
    ItemResponse.BUBBLE_TO_SANDBOX,
    spec.select.getOr(Fun.never),
    backstage.shared.providers
  );

  const widgetSpec: MenuTypes.MenuSpec = {
    ...menuSpec,
    markers: MenuParts.markers(presets),
    movement: deriveMenuMovement(columns, presets),
    // TINY-10806: Avoid duplication of ARIA role="menu" in the accessibility tree for Color Swatch menu item.
    showMenuRole: false
  };

  return {
    type: 'widget',
    data: { value: Id.generate('widget-id') },
    dom: {
      tag: 'div',
      classes: [ 'tox-fancymenuitem' ]
    },
    autofocus: true,
    components: [
      ItemWidget.parts.widget(AlloyMenu.sketch(widgetSpec))
    ]
  };
};

export { renderImageSelector };
