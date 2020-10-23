/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Singleton } from '@ephox/katamari';
import { Dimension } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';
import * as Settings from '../../api/Settings';

const normaliseLineHeight = (input: string) => Dimension.normalise(input, [ 'fixed', 'relative', 'empty' ]).getOr(input);

const getLineHeights = (editor: Editor): Menu.ToggleMenuItemSpec[] => {
  const options = Settings.getLineHeightFormats(editor);

  // All of the API objects (one for each format)
  const apis = new Map<string, Menu.ToggleMenuItemInstanceApi>();
  // The currently active API object (in a destroyable so that it automatically cleans itself up)
  const lastApi = Singleton.destroyable();

  const callback = () => {
    const current = normaliseLineHeight(editor.queryCommandValue('LineHeight'));
    Optional.from(apis.get(current))
      .fold(
        () => lastApi.clear(),
        (api) => {
          lastApi.set({
            destroy: () => {
              api.setActive(false);
            }
          });
          api.setActive(true);
        }
      );
  };

  editor.on('nodeChange', callback);

  return Arr.map(
    options,
    (value, i) => ({
      type: 'togglemenuitem',
      text: value,
      onSetup: (api) => {
        apis.set(normaliseLineHeight(value), api);

        if (i + 1 === options.length) {
          // run the callback once on startup (on the last option so that we know the apis map has been set up)
          callback();
        }
        return () => {
          // only clean up global things once
          if (i === 0) {
            editor.off('nodeChange', callback);
            lastApi.clear();
          }
        };
      },
      onAction: () => editor.execCommand('LineHeight', false, value)
    })
  );
};

const registerMenuItems = (editor: Editor) => {
  editor.ui.registry.addNestedMenuItem('lineheight', {
    type: 'nestedmenuitem',
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
