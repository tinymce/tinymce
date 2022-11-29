import { ItemTypes, ItemWidget, Menu as AlloyMenu, MenuTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Fun, Id } from '@ephox/katamari';

import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import * as ColorSwatch from 'tinymce/themes/silver/ui/core/color/ColorSwatch';

import { createPartialChoiceMenu } from '../../menu/MenuChoice';
import { deriveMenuMovement } from '../../menu/MenuMovement';
import * as MenuParts from '../../menu/MenuParts';
import ItemResponse from '../ItemResponse';

export const renderColorSwatchItem = (spec: Menu.ColorSwatchMenuItem, backstage: UiFactoryBackstage): ItemTypes.WidgetItemSpec => {
  const items = getColorItems(spec, backstage);
  const columns = backstage.colorinput.getColorCols(spec.initData.storageKey);
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
    spec.select.getOr(Fun.never),
    backstage.shared.providers
  );

  const widgetSpec: MenuTypes.MenuSpec = {
    ...menuSpec,
    markers: MenuParts.markers(presets),
    movement: deriveMenuMovement(columns, presets)
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

const getColorItems = (spec: Menu.ColorSwatchMenuItem, backstage: UiFactoryBackstage): Menu.ChoiceMenuItemSpec[] => {
  const useCustomColors = spec.initData.allowCustomColors && backstage.colorinput.hasCustomColors();
  return spec.initData.colors.fold(
    () => ColorSwatch.getColors(backstage.colorinput.getColors(spec.initData.storageKey), spec.initData.storageKey, useCustomColors),
    (colors) => colors.concat(ColorSwatch.getAdditionalColors(useCustomColors))
  );
};
