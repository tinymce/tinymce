/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as ConvertShortcut from '../alien/ConvertShortcut';
import * as KeyboardShortcuts from '../data/KeyboardShortcuts';

export interface ShortcutActionPairType {
  shortcuts: string[];
  action: string;
}

const tab = (): Dialog.TabSpec => {
  const shortcutList = Arr.map(KeyboardShortcuts.shortcuts, (shortcut: ShortcutActionPairType) => {
    const shortcutText = Arr.map(shortcut.shortcuts, ConvertShortcut.convertText).join(' or ');
    return [ shortcut.action, shortcutText ];
  });

  const tablePanel: Dialog.TableSpec = {
    type: 'table',
    // TODO: Fix table styles #TINY-2909
    header: [ 'Action', 'Shortcut' ],
    cells: shortcutList
  };
  return {
    name: 'shortcuts',
    title: 'Handy Shortcuts',
    items: [
      tablePanel
    ]
  };
};

export {
  tab
};
