/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ShortcutActionPairType } from '../ui/KeyboardShortcutsTab';

const shortcuts: ShortcutActionPairType[] = [
  { shortcuts: ['Meta + B'], action: 'Bold' },
  { shortcuts: ['Meta + I'], action: 'Italic' },
  { shortcuts: ['Meta + U'], action: 'Underline' },
  { shortcuts: ['Meta + A'], action: 'Select all' },
  { shortcuts: ['Meta + Y', 'Meta + Shift + Z'], action: 'Redo' },
  { shortcuts: ['Meta + Z'], action: 'Undo' },
  { shortcuts: ['Ctrl + Alt + 1'], action: 'Header 1' },
  { shortcuts: ['Ctrl + Alt + 2'], action: 'Header 2' },
  { shortcuts: ['Ctrl + Alt + 3'], action: 'Header 3' },
  { shortcuts: ['Ctrl + Alt + 4'], action: 'Header 4' },
  { shortcuts: ['Ctrl + Alt + 5'], action: 'Header 5' },
  { shortcuts: ['Ctrl + Alt + 6'], action: 'Header 6' },
  { shortcuts: ['Ctrl + Alt + 7'], action: 'Paragraph' },
  { shortcuts: ['Ctrl + Alt + 8'], action: 'Div' },
  { shortcuts: ['Ctrl + Alt + 9'], action: 'Address' },
  { shortcuts: ['Alt + 0'], action: 'Open help dialog' },
  { shortcuts: ['Alt + F9'], action: 'Focus to menubar' },
  { shortcuts: ['Alt + F10'], action: 'Focus to toolbar' },
  { shortcuts: ['Alt + F11'], action: 'Focus to element path' },
  { shortcuts: ['Ctrl + F9'], action: 'Focus to contextual toolbar' },
  { shortcuts: ['Shift + Enter'], action: 'Open popup menu for split buttons' },
  { shortcuts: ['Meta + K'], action: 'Insert link (if link plugin activated)' },
  { shortcuts: ['Meta + S'], action: 'Save (if save plugin activated)' },
  { shortcuts: ['Meta + F'], action: 'Find (if searchreplace plugin activated)' },
  { shortcuts: ['Meta + Shift + F'], action: 'Switch to or from fullscreen mode' }
];

export default {
  shortcuts
};