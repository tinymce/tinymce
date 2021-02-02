/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Optional, Strings } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import * as Styles from '../actions/Styles';
import { getDefaultAttributes, getDefaultStyles, shouldStyleWithCss } from '../api/Settings';
import { getRowType } from '../core/TableSections';
import * as Util from '../core/Util';

/**
 * @class tinymce.table.ui.Helpers
 * @private
 */

// Note: Need to use a types here, as types are iterable whereas interfaces are not
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type TableData = {
  height: string;
  width: string;
  cellspacing: string;
  cellpadding: string;
  caption: boolean;
  class?: string;
  align: string;
  border: string;
  cols?: string;
  rows?: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RowData = {
  height: string;
  class: string;
  align: string;
  type: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CellData = {
  width: string;
  height: string;
  scope: string;
  celltype: 'td' | 'th';
  class: string;
  halign: string;
  valign: string;
  borderwidth?: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
};

interface ClassListValue {
  title?: string;
  text?: string;
  value: string;
}

interface ClassListGroup {
  title?: string;
  text?: string;
  menu: ClassListItem[];
}

type ClassListItem = ClassListValue | ClassListGroup;

type InternalClassListItem = Dialog.ListBoxItemSpec;

const isListGroup = (item: ClassListItem): item is ClassListGroup => Obj.hasNonNullableKey(item as Record<string, any>, 'menu');

const buildListItems = (inputList: ClassListItem[], startItems?: InternalClassListItem[]): InternalClassListItem[] => {
  // Used to also take a callback (that in all instances applied an item.textStyles property using Formatter)
  // to each item but seems to have been an undocumented TinyMCE 4 or even 3 feature and doesn't work with
  // TinyMCE 5 selectboxes so deleted
  const appendItems = (values: ClassListItem[], acc: InternalClassListItem[]) =>
    // item.text is not documented - maybe deprecated option we can delete??
    acc.concat(Arr.map(values, (item) => {
      const text = item.text || item.title;

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
    }));

  return appendItems(inputList, startItems || []);
};

const rgbToHex = (dom: DOMUtils) => (value: string) => Strings.startsWith(value, 'rgb') ? dom.toHex(value) : value;

const extractAdvancedStyles = (dom: DOMUtils, elm: Node) => {
  const element = SugarElement.fromDom(elm);
  return {
    borderwidth: Css.getRaw(element, 'border-width').getOr(''),
    borderstyle: Css.getRaw(element, 'border-style').getOr(''),
    bordercolor: Css.getRaw(element, 'border-color').map(rgbToHex(dom)).getOr(''),
    backgroundcolor: Css.getRaw(element, 'background-color').map(rgbToHex(dom)).getOr('')
  };
};

const getSharedValues = <T>(data: Array<T>) => {
  // TODO surely there's a better way to do this??
  // Mutates baseData to return an object that contains only the values
  // that were the same across all objects in data
  const baseData = data[0];
  const comparisonData = data.slice(1);

  Arr.each(comparisonData, (items) => {
    Arr.each(Obj.keys(baseData), (key) => {
      Obj.each(items, (itemValue, itemKey) => {
        const comparisonValue = baseData[key];
        if (comparisonValue !== '' && key === itemKey) {
          if (comparisonValue !== itemValue) {
            baseData[key] = '';
          }
        }
      });
    });
  });

  return baseData;
};

const getAdvancedTab = (dialogName: 'table' | 'row' | 'cell') => {
  const advTabItems: Dialog.BodyComponentSpec[] = [
    {
      name: 'borderstyle',
      type: 'listbox',
      label: 'Border style',
      items: [
        { text: 'Select...', value: '' },
        { text: 'Solid', value: 'solid' },
        { text: 'Dotted', value: 'dotted' },
        { text: 'Dashed', value: 'dashed' },
        { text: 'Double', value: 'double' },
        { text: 'Groove', value: 'groove' },
        { text: 'Ridge', value: 'ridge' },
        { text: 'Inset', value: 'inset' },
        { text: 'Outset', value: 'outset' },
        { text: 'None', value: 'none' },
        { text: 'Hidden', value: 'hidden' }
      ]
    },
    {
      name: 'bordercolor',
      type: 'colorinput',
      label: 'Border color'
    },
    {
      name: 'backgroundcolor',
      type: 'colorinput',
      label: 'Background color'
    }
  ];

  const borderWidth: Dialog.InputSpec = {
    name: 'borderwidth',
    type: 'input',
    label: 'Border width'
  };

  const items = dialogName === 'cell' ? ([ borderWidth ] as Dialog.BodyComponentSpec[]).concat(advTabItems) : advTabItems;

  return {
    title: 'Advanced',
    name: 'advanced',
    items
  };
};

// The extractDataFrom... functions are in this file partly for code reuse and partly so we can test them,
// because some of these are crazy complicated

const getAlignment = (formats: string[], formatName: string, editor: Editor, elm: Node) =>
  Arr.find(formats, (name) => editor.formatter.matchNode(elm, formatName + name)).getOr('');
const getHAlignment = Fun.curry(getAlignment, [ 'left', 'center', 'right' ], 'align');
const getVAlignment = Fun.curry(getAlignment, [ 'top', 'middle', 'bottom' ], 'valign');

const extractDataFromSettings = (editor: Editor, hasAdvTableTab: boolean): TableData => {
  const style = getDefaultStyles(editor);
  const attrs = getDefaultAttributes(editor);

  const extractAdvancedStyleData = (dom: DOMUtils) => ({
    borderstyle: Obj.get(style, 'border-style').getOr(''),
    bordercolor: rgbToHex(dom)(Obj.get(style, 'border-color').getOr('')),
    backgroundcolor: rgbToHex(dom)(Obj.get(style, 'background-color').getOr(''))
  });

  const defaultData: TableData = {
    height: '',
    width: '100%',
    cellspacing: '',
    cellpadding: '',
    caption: false,
    class: '',
    align: '',
    border: ''
  };

  const getBorder = () => {
    const borderWidth = style['border-width'];
    if (shouldStyleWithCss(editor) && borderWidth) {
      return { border: borderWidth };
    }
    return Obj.get(attrs, 'border').fold(() => ({}), (border) => ({ border }));
  };

  const advStyle = (hasAdvTableTab ? extractAdvancedStyleData(editor.dom) : {});

  const getCellPaddingCellSpacing = () => {
    const spacing = Obj.get(style, 'border-spacing').or(Obj.get(attrs, 'cellspacing')).fold( () => ({}), (cellspacing) => ({ cellspacing }));
    const padding = Obj.get(style, 'border-padding').or(Obj.get(attrs, 'cellpadding')).fold( () => ({}), (cellpadding) => ({ cellpadding }));
    return {
      ...spacing,
      ...padding
    };
  };

  const data = {
    ...defaultData,
    ...style,
    ...attrs,
    ...advStyle,
    ...getBorder(),
    ...getCellPaddingCellSpacing()
  };
  return data;
};

const extractDataFromTableElement = (editor: Editor, elm: Element, hasAdvTableTab: boolean): TableData => {
  const getBorder = (dom: DOMUtils, elm: Element) => {
    // Cases (in order to check):
    // 1. shouldStyleWithCss - extract border-width style if it exists
    // 2. !shouldStyleWithCss && border attribute - set border attribute as value
    // 3. !shouldStyleWithCss && nothing on the table - grab styles from the first th or td

    const optBorderWidth = Css.getRaw(SugarElement.fromDom(elm), 'border-width');
    if (shouldStyleWithCss(editor) && optBorderWidth.isSome()) {
      return optBorderWidth.getOr('');
    }
    return dom.getAttrib(elm, 'border') || Styles.getTDTHOverallStyle(editor.dom, elm, 'border-width')
      || Styles.getTDTHOverallStyle(editor.dom, elm, 'border');
  };

  const dom = editor.dom;

  return {
    width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    cellspacing: dom.getStyle(elm, 'border-spacing') || dom.getAttrib(elm, 'cellspacing'),
    cellpadding: dom.getAttrib(elm, 'cellpadding') || Styles.getTDTHOverallStyle(editor.dom, elm, 'padding'),
    border: getBorder(dom, elm),
    caption: !!dom.select('caption', elm)[0],
    class: dom.getAttrib(elm, 'class', ''),
    align: getHAlignment(editor, elm),
    ...(hasAdvTableTab ? extractAdvancedStyles(dom, elm) : {})
  };
};

const extractDataFromRowElement = (editor: Editor, elm: HTMLTableRowElement, hasAdvancedRowTab: boolean): RowData => {
  const dom = editor.dom;
  return {
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    class: dom.getAttrib(elm, 'class', ''),
    type: getRowType(editor, elm),
    align: getHAlignment(editor, elm),
    ...(hasAdvancedRowTab ? extractAdvancedStyles(dom, elm) : {})
  };
};

const extractDataFromCellElement = (editor: Editor, cell: HTMLTableCellElement, hasAdvancedCellTab: boolean, column: Optional<HTMLTableColElement>): CellData => {
  const dom = editor.dom;
  const colElm = column.getOr(cell);

  const getStyle = (element: HTMLElement, style: string) => dom.getStyle(element, style) || dom.getAttrib(element, style);

  return {
    width: getStyle(colElm, 'width'),
    height: getStyle(cell, 'height'),
    scope: dom.getAttrib(cell, 'scope'),
    celltype: Util.getNodeName(cell) as 'td' | 'th',
    class: dom.getAttrib(cell, 'class', ''),
    halign: getHAlignment(editor, cell),
    valign: getVAlignment(editor, cell),
    ...(hasAdvancedCellTab ? extractAdvancedStyles(dom, cell) : {})
  };
};

export { buildListItems, extractAdvancedStyles, getSharedValues, getAdvancedTab, extractDataFromTableElement, extractDataFromRowElement, extractDataFromCellElement, extractDataFromSettings };

