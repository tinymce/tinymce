/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';

export type SingleMenuItemSpec = Menu.MenuItemSpec | Menu.NestedMenuItemSpec | Menu.ToggleMenuItemSpec | Menu.SeparatorMenuItemSpec |
Menu.ChoiceMenuItemSpec | Menu.FancyMenuItemSpec;
