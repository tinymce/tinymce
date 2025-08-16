import { Arr } from '@ephox/katamari';

import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as ConvertShortcut from '../alien/ConvertShortcut';
import * as KeyboardShortcuts from '../data/KeyboardShortcuts';
import Editor from 'tinymce/core/api/Editor';

export interface ShortcutActionPairType {
  shortcuts: string[];
  action: string;
}

const tab = (editor: Editor): Dialog.TabSpec & { name: string } => {
  const shortcutList = Arr.filter(Arr.map(KeyboardShortcuts.shortcuts, (shortcut: ShortcutActionPairType) => {
    const existingShortcutPatterns = Arr.filter(shortcut.shortcuts, (pattern: string) => editor.shortcuts.includes(pattern));
    if (existingShortcutPatterns.length === 0) return undefined;
    const shortcutText = Arr.map(existingShortcutPatterns, ConvertShortcut.convertText).join(' or ');
    return [ shortcut.action, shortcutText ];
  }), (shortcut: any) => shortcut !== undefined);

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
