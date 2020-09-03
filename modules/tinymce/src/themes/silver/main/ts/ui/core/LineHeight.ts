/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import { Arr, Optional, Unique } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

const defaultLineHeights = '1 1.1 1.2 1.3 1.4 1.5 2';

const getLineHeights = (editor: Editor): Menu.ToggleMenuItemSpec[] => {
  const raw = editor.queryCommandValue('LineHeight');
  const current = raw !== '' ? Optional.some(raw) : Optional.none<string>();
  const alwaysAvailable = editor.getParam('lineheight_formats', defaultLineHeights, 'string').split(' ');

  const allOptions = [ ...alwaysAvailable, ...current.toArray() ];
  const deduped = Unique.stringArray(allOptions);
  const sorted = Arr.sort(deduped, (x, y) => parseFloat(x) - parseFloat(y));

  return Arr.map(
    sorted,
    (value) => ({
      type: 'togglemenuitem',
      active: current.is(value),
      text: value,
      onAction: () => editor.execCommand('LineHeight', false, value)
    })
  );
};

const registerMenuItems = (editor: Editor) => {
  editor.ui.registry.addNestedMenuItem('line-height', {
    type: 'nestedmenuitem',
    icon: 'line-height',
    text: 'Line height',
    getSubmenuItems: () => getLineHeights(editor)
  });
};

const registerButtons = (editor: Editor) => {
  editor.ui.registry.addMenuButton('line-height', {
    tooltip: 'Line height',
    icon: 'line-height',
    fetch: (callback) => callback(getLineHeights(editor))
  });
};

const register = (editor: Editor) => {
  registerMenuItems(editor);
  registerButtons(editor);
};

export {
  register
};
