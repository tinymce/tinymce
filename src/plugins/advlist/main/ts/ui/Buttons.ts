/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import Actions from '../core/Actions';
import ListUtils from '../core/ListUtils';

const enum ListType {
  OrderedList = 'OL',
  UnorderedList = 'UL'
}

const findIndex = function (list, predicate) {
  for (let index = 0; index < list.length; index++) {
    const element = list[index];

    if (predicate(element)) {
      return index;
    }
  }
  return -1;
};

const listState = function (editor, listName) {
  return function (e) {
    const ctrl = e.control;

    editor.on('NodeChange', function (e) {
      const tableCellIndex = findIndex(e.parents, ListUtils.isTableCellNode);
      const parents = tableCellIndex !== -1 ? e.parents.slice(0, tableCellIndex) : e.parents;
      const lists = Tools.grep(parents, ListUtils.isListNode(editor));
      ctrl.active(lists.length > 0 && lists[0].nodeName === listName);
    });
  };
};

const styleValueToText = function (styleValue) {
  return styleValue.replace(/\-/g, ' ').replace(/\b\w/g, function (chr) {
    return chr.toUpperCase();
  });
};

const addSplitButton = function (editor, id, tooltip, cmd, nodeName, styles) {
  editor.ui.registry.addSplitButton(id, {
    type: 'splitbutton',
    active: false,
    tooltip,
    icon: nodeName === ListType.OrderedList ? 'ordered-list' : 'unordered-list',
    presets: 'toolbar',
    columns: 3,
    fetch: (callback) => {
      const items = Tools.map(styles, (styleValue) => {
        const iconStyle = nodeName === ListType.OrderedList ? 'num' : 'bull';
        const iconName = styleValue === 'disc' || styleValue === 'decimal' ? 'default' : styleValue;
        const itemValue = styleValue === 'default' ? '' : styleValue;
        const displayText = styleValueToText(styleValue);
        return {
          type: 'choiceitem',
          value: itemValue,
          icon: 'list-' +  iconStyle + '-' + iconName,
          text: displayText,
          ariaLabel: displayText
        };
      });
      callback(items);
    },
    onAction: () => {
      editor.execCommand(cmd);
    },
    onItemAction: (splitButtonApi, value) => {
      Actions.applyListFormat(editor, nodeName, value);
    }
  });
};

const addButton = function (editor, id, tooltip, cmd, nodeName, styles) {
  editor.ui.registry.addButton(id, {
    type: 'button',
    active: false,
    tooltip,
    icon: nodeName === ListType.OrderedList ? 'icon-ordered-list' : 'icon-unordered-list',
    onPostRender: listState(editor, nodeName),
    onclick () {
      editor.execCommand(cmd);
    }
  });
};

const addControl = function (editor, id, tooltip, cmd, nodeName, styles) {
  if (styles.length > 0) {
    addSplitButton(editor, id, tooltip, cmd, nodeName, styles);
  } else {
    addButton(editor, id, tooltip, cmd, nodeName, styles);
  }
};

const register = function (editor) {
  addControl(editor, 'numlist', 'Numbered list', 'InsertOrderedList', ListType.OrderedList, Settings.getNumberStyles(editor));
  addControl(editor, 'bullist', 'Bullet list', 'InsertUnorderedList', ListType.UnorderedList, Settings.getBulletStyles(editor));
};

export default {
  register
};