/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';

export interface UiFactoryBackstageForHeader {
  isPositionedAtTop: () => boolean;
  getDockingMode: () => 'top' | 'bottom';
  setDockingMode: (mode: 'top' | 'bottom') => void;
}

export const HeaderBackstage = (editor: Editor): UiFactoryBackstageForHeader => {
  const mode = Cell<'top' | 'bottom'>(Settings.isToolbarLocationBottom(editor) ? 'bottom' : 'top');

  return {
    isPositionedAtTop: () => mode.get() === 'top',
    getDockingMode: mode.get,
    setDockingMode: mode.set
  };
};
