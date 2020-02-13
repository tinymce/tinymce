import { ItemTypes, MenuTypes } from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { Types } from '@ephox/bridge';
import { console } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { components as menuComponents, dom as menuDom } from './MenuParts';

import { forCollection, forHorizontalCollection, forSwatch, forToolbar } from './MenuStructures';
import { SingleMenuItemApi } from './SingleMenuTypes';

export const hasIcon = (item) => item.icon !== undefined || item.type === 'togglemenuitem' || item.type === 'choicemenuitem';
export const menuHasIcons = (xs: SingleMenuItemApi[]) => Arr.exists(xs, hasIcon);

export interface PartialMenuSpec {
  value: string;
  dom: MenuTypes.MenuSpec['dom'];
  components: MenuTypes.MenuSpec['components'];
  items: MenuTypes.MenuSpec['items'];
}

export const handleError = (error: ValueSchema.SchemaError<any>): Option<ItemTypes.ItemSpec> => {
  // tslint:disable-next-line:no-console
  console.error(ValueSchema.formatError(error));
  // tslint:disable-next-line:no-console
  console.log(error);
  return Option.none();
};

export const createHorizontalPartialMenuWithAlloyItems = (value: string, _hasIcons: boolean, items, _columns: Types.ColumnTypes, _presets: Types.PresetTypes): PartialMenuSpec => {
  const structure = forHorizontalCollection(items);
  return {
    value,
    dom: structure.dom,
    components: structure.components,
    items
  };
};

// TODO: Potentially make this private again.
export const createPartialMenuWithAlloyItems = (value: string, hasIcons: boolean, items, columns: Types.ColumnTypes, presets: Types.PresetTypes): PartialMenuSpec => {
  if (presets === 'color') {
    const structure = forSwatch(columns);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  if (presets === 'normal' && columns === 'auto') {
    const structure = forCollection(columns, items);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  if (presets === 'normal' && columns === 1) {
    const structure = forCollection(1, items);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  if (presets === 'normal') {
    const structure = forCollection(columns, items);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  if (presets === 'listpreview' && columns !== 'auto') {
    const structure = forToolbar(columns);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  return {
    value,
    dom: menuDom(hasIcons, columns, presets),
    components: menuComponents,
    items
  };
};
