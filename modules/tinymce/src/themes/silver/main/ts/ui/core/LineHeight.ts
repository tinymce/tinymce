/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Singleton } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

const defaultLineHeights = '1 1.1 1.2 1.3 1.4 1.5 2';

const getLineHeights = (editor: Editor): Menu.ToggleMenuItemSpec[] => {
  const options = editor.getParam('lineheight_formats', defaultLineHeights, 'string').split(' ');

  const apis: Record<string, Menu.ToggleMenuItemInstanceApi> = {};
  const lastApi = Singleton.destroyable();
  const callback = () => {
    const current = editor.queryCommandValue('LineHeight');
    Obj.get(apis, current).fold(
      () => lastApi.clear(),
      (api) => {
        lastApi.set({
          destroy: () => {
            api.setActive(false);
          }
        })
        api.setActive(true);
      }
    );
  };

  editor.on('NodeChange', callback);

  return Arr.map(
    options,
    (value, i) => ({
      type: 'togglemenuitem',
      text: value,
      onSetup: (api) => {
        apis[value] = api;

        if (i + 1 === options.length) {
          callback();
        }
        return () => {
          if (i === 0) {
            editor.off('NodeChange', callback);
            lastApi.clear();
          }
        }
      },
      onAction: () => editor.execCommand('LineHeight', false, value)
    })
  );
};

const registerMenuItems = (editor: Editor) => {
  editor.ui.registry.addNestedMenuItem('lineheight', {
    type: 'nestedmenuitem',
    icon: 'line-height',
    text: 'Line height',
    getSubmenuItems: () => getLineHeights(editor)
  });
};

const registerButtons = (editor: Editor) => {
  editor.ui.registry.addMenuButton('lineheight', {
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
