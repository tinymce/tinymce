/**
 * Toolbar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Factory from 'tinymce/core/api/ui/Factory';
import Type from '../alien/Type';

const getSelectorStateResult = function (itemName, item) {
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

const bindSelectorChanged = function (editor, itemName, item) {
  return function () {
    const result = getSelectorStateResult(itemName, item);
    if (result !== null) {
      editor.selection.selectorChanged(result.selector, result.handler);
    }
  };
};

const itemsToArray = function (items) {
  if (Type.isArray(items)) {
    return items;
  } else if (Type.isString(items)) {
    return items.split(/[ ,]/);
  }

  return [];
};

const create = function (editor, name, items) {
  const toolbarItems = [];
  let buttonGroup;

  if (!items) {
    return;
  }

  Tools.each(itemsToArray(items), function (item) {
    let itemName;

    if (item === '|') {
      buttonGroup = null;
    } else {
      if (editor.buttons[item]) {
        if (!buttonGroup) {
          buttonGroup = { type: 'buttongroup', items: [] };
          toolbarItems.push(buttonGroup);
        }

        itemName = item;
        item = editor.buttons[itemName];

        if (typeof item === 'function') {
          item = item();
        }

        item.type = item.type || 'button';

        item = Factory.create(item);
        item.on('postRender', bindSelectorChanged(editor, itemName, item));
        buttonGroup.items.push(item);
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