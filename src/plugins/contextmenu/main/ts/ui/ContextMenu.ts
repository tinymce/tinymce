/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import { getUiContainer } from 'tinymce/plugins/contextmenu/core/UiContainer';

const renderMenu = function (editor, visibleState) {
  let menu, contextmenu;
  const items = [];

  contextmenu = Settings.getContextMenu(editor);
  Tools.each(contextmenu.split(/[ ,]/), function (name) {
    let item = editor.menuItems[name];

    if (name === '|') {
      item = { text: name };
    }

    if (item) {
      item.shortcut = ''; // Hide shortcuts
      items.push(item);
    }
  });

  for (let i = 0; i < items.length; i++) {
    if (items[i].text === '|') {
      if (i === 0 || i === items.length - 1) {
        items.splice(i, 1);
      }
    }
  }

  menu = Factory.create('menu', {
    items,
    context: 'contextmenu',
    classes: 'contextmenu'
  });

  menu.uiContainer = getUiContainer(editor);
  menu.renderTo(getUiContainer(editor));

  menu.on('hide', function (e) {
    if (e.control === this) {
      visibleState.set(false);
    }
  });

  editor.on('remove', function () {
    menu.remove();
    menu = null;
  });

  return menu;
};

const show = function (editor, pos, visibleState, menu) {
  if (menu.get() === null) {
    menu.set(renderMenu(editor, visibleState));
  } else {
    menu.get().show();
  }

  menu.get().moveTo(pos.x, pos.y);
  visibleState.set(true);
};

export default {
  show
};