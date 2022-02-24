import { ItemTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Obj, Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { renderColorSwatchItem } from './ColorSwatchItem';
import { renderInsertTableMenuItem } from './InsertTableMenuItem';

const fancyMenuItems: Record<keyof Menu.FancyActionArgsMap, (mi: Menu.FancyMenuItem, bs: UiFactoryBackstage) => ItemTypes.WidgetItemSpec> = {
  inserttable: renderInsertTableMenuItem,
  colorswatch: renderColorSwatchItem
};

const renderFancyMenuItem = (spec: Menu.FancyMenuItem, backstage: UiFactoryBackstage): Optional<ItemTypes.WidgetItemSpec> =>
  Obj.get(fancyMenuItems, spec.fancytype).map((render) => render(spec, backstage));

export {
  renderFancyMenuItem
};
