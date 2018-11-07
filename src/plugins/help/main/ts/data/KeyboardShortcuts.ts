/**
 * KeyboardShortcuts.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { ShortcutActionPairType } from '../ui/KeyboardShortcutsTab';

const shortcuts: ShortcutActionPairType[] = [
  { shortcuts: ['Ctrl + B'], action: 'Bold' },
  { shortcuts: ['Ctrl + I'], action: 'Italic' },
  { shortcuts: ['Ctrl + U'], action: 'Underline' },
  { shortcuts: ['Ctrl + A'], action: 'Select all' },
  { shortcuts: ['Ctrl + Y', 'Ctrl + Shift + Z'], action: 'Redo' },
  { shortcuts: ['Ctrl + Z'], action: 'Undo' },
  { shortcuts: ['Ctrl + Alt + 1'], action: 'Header 1' },
  { shortcuts: ['Ctrl + Alt + 2'], action: 'Header 2' },
  { shortcuts: ['Ctrl + Alt + 3'], action: 'Header 3' },
  { shortcuts: ['Ctrl + Alt + 4'], action: 'Header 4' },
  { shortcuts: ['Ctrl + Alt + 5'], action: 'Header 5' },
  { shortcuts: ['Ctrl + Alt + 6'], action: 'Header 6' },
  { shortcuts: ['Ctrl + Alt + 7'], action: 'Paragraph' },
  { shortcuts: ['Ctrl + Alt + 8'], action: 'Div' },
  { shortcuts: ['Ctrl + Alt + 9'], action: 'Address' },
  { shortcuts: ['Alt + F9'], action: 'Focus to menubar' },
  { shortcuts: ['Alt + F10'], action: 'Focus to toolbar' },
  { shortcuts: ['Alt + F11'], action: 'Focus to element path' },
  { shortcuts: ['Ctrl + F9'], action: 'Focus to contextual toolbar' },
  { shortcuts: ['Ctrl + K'], action: 'Insert link (if link plugin activated)' },
  { shortcuts: ['Ctrl + S'], action: 'Save (if save plugin activated)' },
  { shortcuts: ['Ctrl + F'], action: 'Find (if searchreplace plugin activated)' },
  { shortcuts: ['Ctrl + Shift + F'], action: 'Switch to or from fullscreen mode' }
];

export default {
  shortcuts
};