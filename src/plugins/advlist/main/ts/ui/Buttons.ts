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
import ListStyles from './ListStyles';

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

const updateSelection = function (editor) {
  return function (e) {
    const listStyleType = ListUtils.getSelectedStyleType(editor);
    e.control.items().each(function (ctrl) {
      ctrl.active(ctrl.settings.data === listStyleType);
    });
  };
};

const addSplitButton = function (editor, id, tooltip, cmd, nodeName, styles) {
  editor.addButton(id, {
    active: false,
    type: 'splitbutton',
    tooltip,
    menu: ListStyles.toMenuItems(styles),
    onPostRender: listState(editor, nodeName),
    onshow: updateSelection(editor),
    onselect (e) {
      Actions.applyListFormat(editor, nodeName, e.control.settings.data);
    },
    onclick () {
      editor.execCommand(cmd);
    }
  });
};

const addButton = function (editor, id, tooltip, cmd, nodeName, styles) {
  editor.addButton(id, {
    active: false,
    type: 'button',
    tooltip,
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
  addControl(editor, 'numlist', 'Numbered list', 'InsertOrderedList', 'OL', Settings.getNumberStyles(editor));
  addControl(editor, 'bullist', 'Bullet list', 'InsertUnorderedList', 'UL', Settings.getBulletStyles(editor));
};

export default {
  register
};