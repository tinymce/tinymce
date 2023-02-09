import { Transformations } from '@ephox/acid';
import { Arr, Obj, Singleton, Strings } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog, Menu } from 'tinymce/core/api/ui/Ui';

import * as TableSelection from '../selection/TableSelection';

export interface UserListValue {
  readonly title?: string;
  readonly text?: string;
  readonly value: string;
}

export interface UserListGroup {
  readonly title?: string;
  readonly text?: string;
  readonly menu: UserListItem[];
}

export type UserListItem = UserListValue | UserListGroup;

const onSetupToggle = (editor: Editor, formatName: string, formatValue: string) => {
  return (api: Menu.ToggleMenuItemInstanceApi): () => void => {
    const boundCallback = Singleton.unbindable();
    const isNone = Strings.isEmpty(formatValue);

    const init = () => {
      const selectedCells = TableSelection.getCellsFromSelection(editor);

      const checkNode = (cell: SugarElement<Element>) =>
        editor.formatter.match(formatName, { value: formatValue }, cell.dom, isNone);

      // If value is empty (A None-entry in the list), check if the format is not set at all. Otherwise, check if the format is set to the correct value.
      if (isNone) {
        api.setActive(!Arr.exists(selectedCells, checkNode));
        boundCallback.set(editor.formatter.formatChanged(formatName, (match) => api.setActive(!match), true));
      } else {
        api.setActive(Arr.forall(selectedCells, checkNode));
        boundCallback.set(editor.formatter.formatChanged(formatName, api.setActive, false, { value: formatValue }));
      }
    };

    // The editor may or may not have been setup yet, so check for that
    editor.initialized ? init() : editor.on('init', init);

    return boundCallback.clear;
  };
};

export const isListGroup = (item: UserListItem): item is UserListGroup =>
  Obj.hasNonNullableKey(item as UserListGroup, 'menu');

const buildListItems = (items: UserListItem[]): Dialog.ListBoxItemSpec[] =>
  Arr.map(items, (item) => {
    // item.text is not documented - maybe deprecated option we can delete??
    const text = item.text || item.title || '';
    if (isListGroup(item)) {
      return {
        text,
        items: buildListItems(item.menu)
      };
    } else {
      return {
        text,
        value: item.value
      };
    }
  });

const buildMenuItems = (
  editor: Editor,
  items: UserListItem[],
  format: string,
  onAction: (value: string) => void
): Menu.NestedMenuItemContents[] =>
  Arr.map(items, (item): Menu.NestedMenuItemContents => {
    // item.text is not documented - maybe deprecated option we can delete??
    const text = item.text || item.title;
    if (isListGroup(item)) {
      return {
        type: 'nestedmenuitem',
        text,
        getSubmenuItems: () => buildMenuItems(editor, item.menu, format, onAction)
      };
    } else {
      return {
        text,
        type: 'togglemenuitem',
        onAction: () => onAction(item.value),
        onSetup: onSetupToggle(editor, format, item.value)
      };
    }
  });

const applyTableCellStyle = (editor: Editor, style: string) => (value: string): void => {
  editor.execCommand('mceTableApplyCellStyle', false, { [style]: value });
};

const filterNoneItem = (list: UserListItem[]): UserListItem[] =>
  Arr.bind(list, (item): UserListItem[] => {
    if (isListGroup(item)) {
      return [{ ...item, menu: filterNoneItem(item.menu) }];
    } else {
      return Strings.isNotEmpty(item.value) ? [ item ] : [];
    }
  });

const generateMenuItemsCallback = (editor: Editor, items: UserListItem[], format: string, onAction: (value: string) => void) =>
  (callback: (items: Menu.NestedMenuItemContents[]) => void): void =>
    callback(buildMenuItems(editor, items, format, onAction));

const buildColorMenu = (editor: Editor, colorList: UserListValue[], style: string): Menu.FancyMenuItemSpec[] => {
  const colorMap = Arr.map(colorList, (entry): Menu.ChoiceMenuItemSpec => ({
    text: entry.title,
    value: '#' + Transformations.anyToHex(entry.value).value,
    type: 'choiceitem'
  }));

  return [{
    type: 'fancymenuitem',
    fancytype: 'colorswatch',
    initData: {
      colors: colorMap.length > 0 ? colorMap : undefined,
      allowCustomColors: false
    },
    onAction: (data) => {
      const value = data.value === 'remove' ? '' : data.value;
      editor.execCommand('mceTableApplyCellStyle', false, { [style]: value });
    }
  }];
};

const changeRowHeader = (editor: Editor) => (): void => {
  const currentType = editor.queryCommandValue('mceTableRowType');
  const newType = currentType === 'header' ? 'body' : 'header';
  editor.execCommand('mceTableRowType', false, { type: newType });
};

const changeColumnHeader = (editor: Editor) => (): void => {
  const currentType = editor.queryCommandValue('mceTableColType');
  const newType = currentType === 'th' ? 'td' : 'th';
  editor.execCommand('mceTableColType', false, { type: newType });
};

export {
  onSetupToggle,
  buildMenuItems,
  buildListItems,
  buildColorMenu,
  generateMenuItemsCallback,
  filterNoneItem,
  changeRowHeader,
  changeColumnHeader,
  applyTableCellStyle
};
