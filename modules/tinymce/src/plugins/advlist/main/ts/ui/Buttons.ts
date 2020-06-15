/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import * as Actions from '../core/Actions';
import * as ListUtils from '../core/ListUtils';

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

// <ListStyles>
const styleValueToText = function (styleValue) {
  return styleValue.replace(/\-/g, ' ').replace(/\b\w/g, function (chr) {
    return chr.toUpperCase();
  });
};

const isWithinList = (editor: Editor, e, nodeName) => {
  const tableCellIndex = findIndex(e.parents, ListUtils.isTableCellNode);
  const parents = tableCellIndex !== -1 ? e.parents.slice(0, tableCellIndex) : e.parents;
  const lists = Tools.grep(parents, ListUtils.isListNode(editor));
  return lists.length > 0 && lists[0].nodeName === nodeName;
};

const addSplitButton = function (editor: Editor, id, tooltip, cmd, nodeName, styles) {
  editor.ui.registry.addSplitButton(id, {
    tooltip,
    icon: nodeName === ListType.OrderedList ? 'ordered-list' : 'unordered-list',
    presets: 'listpreview',
    columns: 3,
    fetch: (callback) => {
      const items = Tools.map(styles, (styleValue): Menu.ChoiceMenuItemApi => {
        const iconStyle = nodeName === ListType.OrderedList ? 'num' : 'bull';
        const iconName = styleValue === 'disc' || styleValue === 'decimal' ? 'default' : styleValue;
        const itemValue = styleValue === 'default' ? '' : styleValue;
        const displayText = styleValueToText(styleValue);
        return {
          type: 'choiceitem',
          value: itemValue,
          icon: 'list-' + iconStyle + '-' + iconName,
          text: displayText
        };
      });
      callback(items);
    },
    onAction: () => editor.execCommand(cmd),
    onItemAction: (_splitButtonApi, value) => {
      Actions.applyListFormat(editor, nodeName, value);
    },
    select: (value) => {
      const listStyleType = ListUtils.getSelectedStyleType(editor);
      return listStyleType.map((listStyle) => value === listStyle).getOr(false);
    },
    onSetup: (api) => {
      const nodeChangeHandler = (e) => {
        api.setActive(isWithinList(editor, e, nodeName));
      };
      editor.on('NodeChange', nodeChangeHandler);

      return () => editor.off('NodeChange', nodeChangeHandler);
    }
  });
};

const addButton = function (editor: Editor, id, tooltip, cmd, nodeName, _styles) {
  editor.ui.registry.addToggleButton(id, {
    active: false,
    tooltip,
    icon: nodeName === ListType.OrderedList ? 'ordered-list' : 'unordered-list',
    onSetup: (api) => {
      const nodeChangeHandler = (e) => {
        api.setActive(isWithinList(editor, e, nodeName));
      };
      editor.on('NodeChange', nodeChangeHandler);

      return () => editor.off('NodeChange', nodeChangeHandler);
    },
    onAction: () => editor.execCommand(cmd)
  });
};

const addControl = function (editor, id, tooltip, cmd, nodeName, styles) {
  if (styles.length > 1) {
    addSplitButton(editor, id, tooltip, cmd, nodeName, styles);
  } else {
    addButton(editor, id, tooltip, cmd, nodeName, styles);
  }
};

const register = function (editor) {
  addControl(editor, 'numlist', 'Numbered list', 'InsertOrderedList', ListType.OrderedList, Settings.getNumberStyles(editor));
  addControl(editor, 'bullist', 'Bullet list', 'InsertUnorderedList', ListType.UnorderedList, Settings.getBulletStyles(editor));
};

export {
  register
};
