/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Tools from 'tinymce/core/api/util/Tools';

import * as Settings from '../api/Settings';
import * as Actions from '../core/Actions';
import * as ListUtils from '../core/ListUtils';

const enum ListType {
  OrderedList = 'OL',
  UnorderedList = 'UL'
}

const findIndex = <T>(list: T[], predicate: (element: T) => boolean): number => {
  for (let index = 0; index < list.length; index++) {
    const element = list[index];

    if (predicate(element)) {
      return index;
    }
  }
  return -1;
};

// <ListStyles>
const styleValueToText = (styleValue: string): string => {
  return styleValue.replace(/\-/g, ' ').replace(/\b\w/g, (chr) => {
    return chr.toUpperCase();
  });
};

const isWithinList = (editor: Editor, e: EditorEvent<NodeChangeEvent>, nodeName: ListType): boolean => {
  const tableCellIndex = findIndex(e.parents, ListUtils.isTableCellNode);
  const parents = tableCellIndex !== -1 ? e.parents.slice(0, tableCellIndex) : e.parents;
  const lists = Tools.grep(parents, ListUtils.isListNode(editor));
  return lists.length > 0 && lists[0].nodeName === nodeName;
};

const makeSetupHandler = (editor: Editor, nodeName: ListType) => (api: Toolbar.ToolbarSplitButtonInstanceApi | Toolbar.ToolbarToggleButtonInstanceApi) => {
  const nodeChangeHandler = (e: EditorEvent<NodeChangeEvent>) => {
    api.setActive(isWithinList(editor, e, nodeName));
  };
  editor.on('NodeChange', nodeChangeHandler);

  return () => editor.off('NodeChange', nodeChangeHandler);
};

const addSplitButton = (editor: Editor, id: string, tooltip: string, cmd: string, nodeName: ListType, styles: string[]): void => {
  editor.ui.registry.addSplitButton(id, {
    tooltip,
    icon: nodeName === ListType.OrderedList ? 'ordered-list' : 'unordered-list',
    presets: 'listpreview',
    columns: 3,
    fetch: (callback) => {
      const items = Tools.map(styles, (styleValue): Menu.ChoiceMenuItemSpec => {
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
    onSetup: makeSetupHandler(editor, nodeName)
  });
};

const addButton = (editor: Editor, id: string, tooltip: string, cmd: string, nodeName: ListType, _styles: string[]): void => {
  editor.ui.registry.addToggleButton(id, {
    active: false,
    tooltip,
    icon: nodeName === ListType.OrderedList ? 'ordered-list' : 'unordered-list',
    onSetup: makeSetupHandler(editor, nodeName),
    onAction: () => editor.execCommand(cmd)
  });
};

const addControl = (editor: Editor, id: string, tooltip: string, cmd: string, nodeName: ListType, styles: string[]): void => {
  if (styles.length > 1) {
    addSplitButton(editor, id, tooltip, cmd, nodeName, styles);
  } else {
    addButton(editor, id, tooltip, cmd, nodeName, styles);
  }
};

const register = (editor: Editor): void => {
  addControl(editor, 'numlist', 'Numbered list', 'InsertOrderedList', ListType.OrderedList, Settings.getNumberStyles(editor));
  addControl(editor, 'bullist', 'Bullet list', 'InsertUnorderedList', ListType.UnorderedList, Settings.getBulletStyles(editor));
};

export {
  register
};
