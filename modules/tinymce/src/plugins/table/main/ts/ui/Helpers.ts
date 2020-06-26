/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Element as DomElement, HTMLElement, HTMLTableRowElement, Node } from '@ephox/dom-globals';
import { Arr, Fun, Obj, Strings } from '@ephox/katamari';
import { Css, Element } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import * as Styles from '../actions/Styles';
import { getDefaultAttributes, getDefaultStyles, shouldStyleWithCss } from '../api/Settings';
import { getRowType } from '../core/TableSections';
import * as Util from '../core/Util';

/**
 * @class tinymce.table.ui.Helpers
 * @private
 */

interface ExternalClassListItem {
  title?: string;
  text?: string;
  value: string;
}

type InternalClassListItem = Types.SelectBox.ExternalSelectBoxItem;

const buildListItems = (inputList: any, startItems?: InternalClassListItem[]): InternalClassListItem[] => {
  // Used to also take a callback (that in all instances applied an item.textStyles property using Formatter)
  // to each item but seems to have been an undocumented TinyMCE 4 or even 3 feature and doesn't work with
  // TinyMCE 5 selectboxes so deleted
  const appendItems = (values: ExternalClassListItem[], acc: InternalClassListItem[]) =>
    // TODO TINY-2236 - add item.menu if nested list - hence set up for recursion
    // item.text is not documented - maybe deprecated option we can delete??
    acc.concat(Arr.map(values, (item) => ({
      text: item.text || item.title,
      value: item.value
    })));

  return appendItems(inputList, startItems || []);
};

const rgbToHex = (dom: DOMUtils) => (value: string) => Strings.startsWith(value, 'rgb') ? dom.toHex(value) : value;

const extractAdvancedStyles = (dom: DOMUtils, elm: Node) => {
  const element = Element.fromDom(elm);
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
  const advTabItems: Types.Dialog.BodyComponentApi[] = [
    {
      name: 'borderstyle',
      type: 'selectbox',
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

  const borderWidth: Types.Input.InputApi = {
    name: 'borderwidth',
    type: 'input',
    label: 'Border width'
  };

  const items = dialogName === 'cell' ? ([ borderWidth ] as Types.Dialog.BodyComponentApi[]).concat(advTabItems) : advTabItems;

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

export interface TableData {
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
}

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

const extractDataFromTableElement = (editor: Editor, elm: DomElement, hasAdvTableTab: boolean): TableData => {
  const getBorder = (dom: DOMUtils, elm: DomElement) => {
    // Cases (in order to check):
    // 1. shouldStyleWithCss - extract border-width style if it exists
    // 2. !shouldStyleWithCss && border attribute - set border attribute as value
    // 3. !shouldStyleWithCss && nothing on the table - grab styles from the first th or td

    const optBorderWidth = Css.getRaw(Element.fromDom(elm), 'border-width');
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

export interface RowData {
  height: string;
  scope: string;
  class: string;
  align: string;
  type: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
}

const extractDataFromRowElement = (editor: Editor, elm: HTMLTableRowElement, hasAdvancedRowTab: boolean): RowData => {
  const dom = editor.dom;
  return {
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    scope: dom.getAttrib(elm, 'scope'),
    class: dom.getAttrib(elm, 'class', ''),
    type: getRowType(editor, elm),
    align: getHAlignment(editor, elm),
    ...(hasAdvancedRowTab ? extractAdvancedStyles(dom, elm) : {})
  };
};

export interface CellData {
  width: string;
  height: string;
  scope: string;
  celltype: string;
  class: string;
  halign: string;
  valign: string;
  borderwidth?: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
}

const extractDataFromCellElement = (editor: Editor, elm: HTMLElement, hasAdvancedCellTab: boolean): CellData => {
  const dom = editor.dom;
  return {
    width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    scope: dom.getAttrib(elm, 'scope'),
    celltype: Util.getNodeName(elm),
    class: dom.getAttrib(elm, 'class', ''),
    halign: getHAlignment(editor, elm),
    valign: getVAlignment(editor, elm),
    ...(hasAdvancedCellTab ? extractAdvancedStyles(dom, elm) : {})
  };
};

export { buildListItems, extractAdvancedStyles, getSharedValues, getAdvancedTab, extractDataFromTableElement, extractDataFromRowElement, extractDataFromCellElement, extractDataFromSettings };

