import { Transformations } from '@ephox/acid';
import { Arr, Fun, Obj, Optional, Strings, Type } from '@ephox/katamari';
import { TableLookup, TableOperations } from '@ephox/snooker';
import { Css, SugarElement, SugarElements } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

import * as Styles from '../actions/Styles';
import * as Options from '../api/Options';
import * as Utils from '../core/Utils';

/**
 * @class tinymce.table.ui.Helpers
 * @private
 */

interface AdvancedStyles {
  readonly borderwidth: string;
  readonly borderstyle: string;
  readonly bordercolor: string;
  readonly backgroundcolor: string;
}

// Note: Need to use a types here, as types are iterable whereas interfaces are not
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type TableData = {
  readonly height: string;
  readonly width: string;
  readonly cellspacing: string;
  readonly cellpadding: string;
  readonly caption: boolean;
  readonly align: string;
  readonly border: string;
  class?: string;
  cols?: string;
  rows?: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RowData = {
  readonly height: string;
  readonly class: string;
  readonly align: string;
  readonly type: string;
  readonly borderstyle?: string;
  readonly bordercolor?: string;
  readonly backgroundcolor?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CellData = {
  readonly width: string;
  readonly height: string;
  readonly scope: string;
  readonly celltype: 'td' | 'th';
  readonly class: string;
  readonly halign: string;
  readonly valign: string;
  readonly borderwidth?: string;
  readonly borderstyle?: string;
  readonly bordercolor?: string;
  readonly backgroundcolor?: string;
};

const rgbToHex = (value: string): string =>
  Strings.startsWith(value, 'rgb') ? Transformations.rgbaToHexString(value) : value;

const extractAdvancedStyles = (elm: Node): AdvancedStyles => {
  const element = SugarElement.fromDom(elm);
  return {
    borderwidth: Css.getRaw(element, 'border-width').getOr(''),
    borderstyle: Css.getRaw(element, 'border-style').getOr(''),
    bordercolor: Css.getRaw(element, 'border-color').map(rgbToHex).getOr(''),
    backgroundcolor: Css.getRaw(element, 'background-color').map(rgbToHex).getOr('')
  };
};

const getSharedValues = <T extends Record<string, string>>(data: T[]): T => {
  // TODO surely there's a better way to do this??
  // Mutates baseData to return an object that contains only the values
  // that were the same across all objects in data
  const baseData: Record<string, string> = data[0];
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

  return baseData as T;
};

// The extractDataFrom... functions are in this file partly for code reuse and partly so we can test them,
// because some of these are crazy complicated

const getAlignment = (formats: string[], formatName: string, editor: Editor, elm: Node): string =>
  Arr.find(formats, (name) => !Type.isUndefined(editor.formatter.matchNode(elm, formatName + name))).getOr('');
const getHAlignment = Fun.curry(getAlignment, [ 'left', 'center', 'right' ], 'align');
const getVAlignment = Fun.curry(getAlignment, [ 'top', 'middle', 'bottom' ], 'valign');

const extractDataFromSettings = (editor: Editor, hasAdvTableTab: boolean): TableData => {
  const style = Options.getDefaultStyles(editor);
  const attrs = Options.getDefaultAttributes(editor);

  const extractAdvancedStyleData = () => ({
    borderstyle: Obj.get(style, 'border-style').getOr(''),
    bordercolor: rgbToHex(Obj.get(style, 'border-color').getOr('')),
    backgroundcolor: rgbToHex(Obj.get(style, 'background-color').getOr(''))
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
    if (Options.shouldStyleWithCss(editor) && borderWidth) {
      return { border: borderWidth };
    }
    return Obj.get(attrs, 'border').fold(() => ({}), (border) => ({ border }));
  };

  const advStyle = (hasAdvTableTab ? extractAdvancedStyleData() : {});

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

const getRowType = (elm: HTMLTableRowElement) =>
  TableLookup.table(SugarElement.fromDom(elm)).map((table) => {
    const target = { selection: SugarElements.fromDom(elm.cells) };
    return TableOperations.getRowsType(table, target);
  }).getOr('');

const extractDataFromTableElement = (editor: Editor, elm: Element, hasAdvTableTab: boolean): TableData => {
  const getBorder = (dom: DOMUtils, elm: Element) => {
    // Cases (in order to check):
    // 1. shouldStyleWithCss - extract border-width style if it exists
    // 2. !shouldStyleWithCss && border attribute - set border attribute as value
    // 3. !shouldStyleWithCss && nothing on the table - grab styles from the first th or td

    const optBorderWidth = Css.getRaw(SugarElement.fromDom(elm), 'border-width');
    if (Options.shouldStyleWithCss(editor) && optBorderWidth.isSome()) {
      return optBorderWidth.getOr('');
    }
    return dom.getAttrib(elm, 'border') || Styles.getTDTHOverallStyle(editor.dom, elm, 'border-width')
      || Styles.getTDTHOverallStyle(editor.dom, elm, 'border') || '';
  };

  const dom = editor.dom;

  const cellspacing = Options.shouldStyleWithCss(editor) ?
    dom.getStyle(elm, 'border-spacing') || dom.getAttrib(elm, 'cellspacing') :
    dom.getAttrib(elm, 'cellspacing') || dom.getStyle(elm, 'border-spacing');

  const cellpadding = Options.shouldStyleWithCss(editor) ?
    Styles.getTDTHOverallStyle(dom, elm, 'padding') || dom.getAttrib(elm, 'cellpadding') :
    dom.getAttrib(elm, 'cellpadding') || Styles.getTDTHOverallStyle(dom, elm, 'padding');

  return {
    width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    cellspacing: cellspacing ?? '',
    cellpadding: cellpadding ?? '',
    border: getBorder(dom, elm),
    caption: !!dom.select('caption', elm)[0],
    class: dom.getAttrib(elm, 'class', ''),
    align: getHAlignment(editor, elm),
    ...(hasAdvTableTab ? extractAdvancedStyles(elm) : {})
  };
};

const extractDataFromRowElement = (editor: Editor, elm: HTMLTableRowElement, hasAdvancedRowTab: boolean): RowData => {
  const dom = editor.dom;
  return {
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    class: dom.getAttrib(elm, 'class', ''),
    type: getRowType(elm),
    align: getHAlignment(editor, elm),
    ...(hasAdvancedRowTab ? extractAdvancedStyles(elm) : {})
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
    celltype: Utils.getNodeName(cell) as 'td' | 'th',
    class: dom.getAttrib(cell, 'class', ''),
    halign: getHAlignment(editor, cell),
    valign: getVAlignment(editor, cell),
    ...(hasAdvancedCellTab ? extractAdvancedStyles(cell) : {})
  };
};

export {
  extractAdvancedStyles,
  getSharedValues,
  extractDataFromTableElement,
  extractDataFromRowElement,
  extractDataFromCellElement,
  extractDataFromSettings
};

