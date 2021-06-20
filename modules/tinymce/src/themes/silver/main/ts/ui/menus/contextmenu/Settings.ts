/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const patchPipeConfig = (config: string[] | string) => typeof config === 'string' ? config.split(/[ ,]/) : config;

const shouldNeverUseNative = (editor: Editor): boolean => {
  return editor.getParam('contextmenu_never_use_native', false, 'boolean');
};

const getMenuItems = (editor: Editor, name: string, defaultItems: string): string[] => {
  const contextMenus = editor.ui.registry.getAll().contextMenus;

  return Optional.from(editor.getParam(name)).map(patchPipeConfig).getOrThunk(() =>
    // Filter default context menu items when they are not in the registry (e.g. when the plugin is not loaded)
    Arr.filter(patchPipeConfig(defaultItems), (item) =>
      Obj.has(contextMenus, item)
    )
  );
};

const isContextMenuDisabled = (editor: Editor): boolean => editor.getParam('contextmenu') === false;

const getContextMenu = (editor: Editor): string[] => {
  return getMenuItems(editor, 'contextmenu', 'link linkchecker image imagetools table spellchecker configurepermanentpen');
};

const getAvoidOverlapSelector = (editor: Editor): string => editor.getParam('contextmenu_avoid_overlap', '', 'string');

export {
  shouldNeverUseNative,
  getContextMenu,
  isContextMenuDisabled,
  getAvoidOverlapSelector
};
