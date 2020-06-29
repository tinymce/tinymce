/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import * as Actions from '../core/Actions';

const register = function (editor: Editor) {
  const formats = Settings.getFormats(editor);
  const defaultFormat = Cell(Settings.getDefaultDateTime(editor));

  editor.ui.registry.addSplitButton('insertdatetime', {
    icon: 'insert-time',
    tooltip: 'Insert date/time',
    select: (value) => value === defaultFormat.get(),
    fetch: (done) => {
      done(Tools.map(formats, (format): Menu.ChoiceMenuItemApi => ({ type: 'choiceitem', text: Actions.getDateTime(editor, format), value: format })));
    },
    onAction: (_api) => {
      Actions.insertDateTime(editor, defaultFormat.get());
    },
    onItemAction: (_api, value) => {
      defaultFormat.set(value);
      Actions.insertDateTime(editor, value);
    }
  });

  const makeMenuItemHandler = (format) => () => {
    defaultFormat.set(format);
    Actions.insertDateTime(editor, format);
  };

  editor.ui.registry.addNestedMenuItem('insertdatetime', {
    icon: 'insert-time',
    text: 'Date/time',
    getSubmenuItems: () => Tools.map(formats, (format): Menu.MenuItemApi => ({ type: 'menuitem', text: Actions.getDateTime(editor, format), onAction: makeMenuItemHandler(format) }))
  });
};

export {
  register
};
