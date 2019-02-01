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

const fancyMenuItems: Record<keyof Menu.FancyActionArgsMap, (mi: Menu.FancyMenuItem) => ItemTypes.WidgetItemSpec> = {
  inserttable: renderInsertTableMenuItem
};

const valueOpt = <T>(obj: Record<string, T>, key): Option<T> => {
  return Object.prototype.hasOwnProperty.call(obj, key)
    ? Option.some(obj[key])
    : Option.none();
};

const renderFancyMenuItem = (spec: Menu.FancyMenuItem): Option<ItemTypes.WidgetItemSpec> => {
  return valueOpt(fancyMenuItems, spec.fancytype).map((render) => render(spec));
};

export {
  renderFancyMenuItem
};