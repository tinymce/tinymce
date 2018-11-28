/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { WidgetItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { Menu } from '@ephox/bridge';
import { renderInsertTableMenuItem } from './InsertTableMenuItem';
import { Option } from '@ephox/katamari';

const fancyMenuItems: Record<keyof Menu.FancyActionArgsMap, (mi: Menu.FancyMenuItem) => WidgetItemSpec> = {
  inserttable: renderInsertTableMenuItem
};

const valueOpt = <T>(obj: Record<string, T>, key): Option<T> => {
  return Object.prototype.hasOwnProperty.call(obj, key)
    ? Option.some(obj[key])
    : Option.none();
};

const renderFancyMenuItem = (spec: Menu.FancyMenuItem): Option<WidgetItemSpec> => {
  return valueOpt(fancyMenuItems, spec.fancytype).map((render) => render(spec));
};

export {
  renderFancyMenuItem
};