/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import Factory from 'tinymce/core/api/ui/Factory';
import Type from '../alien/Type';
import { Editor } from 'tinymce/core/api/Editor';

const getSelectorStateResult = function (itemName: string, item) {
  const result = function (selector, handler) {
    return {
      selector,
      handler
    };
  };

  const activeHandler = function (state) {
    item.active(state);
  };

  const disabledHandler = function (state) {
    item.disabled(state);
  };

  if (item.settings.stateSelector) {
    return result(item.settings.stateSelector, activeHandler);
  }

  if (item.settings.disabledStateSelector) {
    return result(item.settings.disabledStateSelector, disabledHandler);
  }

  return null;
};

const bindSelectorChanged = function (editor: Editor, itemName: string, item) {
  return function () {
    const result = getSelectorStateResult(itemName, item);
    if (result !== null) {
      editor.selection.selectorChanged(result.selector, result.handler);
    }
  };
};

const itemsToArray = function (items: string | string[]): string[] {
  if (Type.isArray(items)) {
    return items;
  } else if (Type.isString(items)) {
    return items.split(/[ ,]/);
  }

  return [];
};

const create = function (editor: Editor, name: string, items: string | string[]) {
  const toolbarItems = [];
  let buttonGroup;

  if (!items) {
    return;
  }

  Tools.each(itemsToArray(items), function (item: string) {
    if (item === '|') {
      buttonGroup = null;
    } else {
      if (editor.buttons[item]) {
        if (!buttonGroup) {
          buttonGroup = { type: 'buttongroup', items: [] };
          toolbarItems.push(buttonGroup);
        }

        let button = editor.buttons[item];

        if (Type.isFunction(button)) {
          button = button();
        }

        button.type = button.type || 'button';

        button = Factory.create(button);
        button.on('postRender', bindSelectorChanged(editor, item, button));
        buttonGroup.items.push(button);
      }
    }
  });

  return Factory.create({
    type: 'toolbar',
    layout: 'flow',
    name,
    items: toolbarItems
  });
};

export default {
  create
};