/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import { renderInsertTableMenuItem } from './InsertTableMenuItem';
import { Option } from '@ephox/katamari';
import { ItemTypes } from '@ephox/alloy';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { renderColorSwatchItem } from './ColorSwatchItem';

const fancyMenuItems: Record<keyof Menu.FancyActionArgsMap, (mi: Menu.FancyMenuItem, bs: UiFactoryBackstage) => ItemTypes.WidgetItemSpec> = {
  inserttable: renderInsertTableMenuItem,
  colorswatch: renderColorSwatchItem
};

const valueOpt = <T>(obj: Record<string, T>, key): Option<T> => Object.prototype.hasOwnProperty.call(obj, key)
  ? Option.some(obj[key])
  : Option.none();

const renderFancyMenuItem = (spec: Menu.FancyMenuItem, backstage: UiFactoryBackstage): Option<ItemTypes.WidgetItemSpec> => valueOpt(fancyMenuItems, spec.fancytype).map((render) => render(spec, backstage));

export {
  renderFancyMenuItem
};