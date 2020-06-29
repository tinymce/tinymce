/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Obj, Arr, Option } from '@ephox/katamari';

const patchPipeConfig = (config: string[] | string) => typeof config === 'string' ? config.split(/[ ,]/) : config;

const shouldNeverUseNative = function (editor: Editor): boolean {
  return editor.getParam('contextmenu_never_use_native', false, 'boolean');
};

const getMenuItems = (editor: Editor, name: string, defaultItems: string): string[] => {
  const contextMenus = editor.ui.registry.getAll().contextMenus;

  return Option.from(editor.getParam(name)).map(patchPipeConfig).getOrThunk(() =>
    Arr.filter(patchPipeConfig(defaultItems), (item) =>
      Obj.has(contextMenus, item)
    )
  );
};

const isContextMenuDisabled = (editor: Editor): boolean => editor.getParam('contextmenu') === false;

const getContextMenu = function (editor: Editor): string[] {
  return getMenuItems(editor, 'contextmenu', 'link linkchecker image imagetools table spellchecker configurepermanentpen');
};

export {
  shouldNeverUseNative,
  getContextMenu,
  isContextMenuDisabled
};
