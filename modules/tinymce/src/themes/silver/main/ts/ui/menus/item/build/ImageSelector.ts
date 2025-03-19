import { Menu as AlloyMenu, ItemTypes, ItemWidget, MenuTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Fun, Id } from '@ephox/katamari';

import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { createPartialChoiceMenu } from '../../menu/MenuChoice';
import { deriveMenuMovement } from '../../menu/MenuMovement';
import * as MenuParts from '../../menu/MenuParts';
import ItemResponse from '../ItemResponse';

const renderImageSelector = (spec: Menu.ImageSelectMenuItem, backstage: UiFactoryBackstage): ItemTypes.WidgetItemSpec => {
  const presets = 'imageselector';
  const columns = spec.initData.columns;
  const menuSpec = createPartialChoiceMenu(
    Id.generate('menu-value'),
    spec.initData.items,
    (value) => {
      spec.onAction({ value });
    },
    columns,
    presets,
    ItemResponse.CLOSE_ON_EXECUTE,
    spec.select.getOr(Fun.never),
    backstage.shared.providers
  );

  const widgetSpec: MenuTypes.MenuSpec = {
    ...menuSpec,
    markers: MenuParts.markers(presets),
    movement: deriveMenuMovement(columns, presets),
    // TINY-10806: Avoid duplication of ARIA role="menu" in the accessibility tree for Image Selector menu item.
    showMenuRole: false
  };

  return {
    type: 'widget',
    data: { value: Id.generate('widget-id') },
    dom: {
      tag: 'div',
      classes: [ 'tox-fancymenuitem', 'tox-collection--toolbar' ]
    },
    autofocus: true,
    components: [
      ItemWidget.parts.widget(AlloyMenu.sketch(widgetSpec))
    ]
  };
};

export { renderImageSelector };
