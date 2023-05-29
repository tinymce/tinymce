import { Fun, Obj, Strings, Type } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { StyleMap } from 'tinymce/core/api/html/Styles';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Styles from '../actions/Styles';
import * as Events from '../api/Events';
import * as Options from '../api/Options';
import * as Utils from '../core/Utils';
import * as TableSelection from '../selection/TableSelection';
import { getAdvancedTab } from './DialogAdvancedTab';
import * as Helpers from './Helpers';
import * as TableDialogGeneralTab from './TableDialogGeneralTab';
import * as UiUtils from './UiUtils';

type TableData = Readonly<Helpers.TableData>;
type ModifiedTableData = Partial<TableData>;

// Explore the layers of the table till we find the first layer of tds or ths
const styleTDTH = (dom: DOMUtils, elm: Element, name: string | StyleMap, value?: string | number): void => {
  if (elm.tagName === 'TD' || elm.tagName === 'TH') {
    if (Type.isString(name) && Type.isNonNullable(value)) {
      dom.setStyle(elm, name, value);
    } else {
      dom.setStyles(elm, name as StyleMap);
    }
  } else {
    if (elm.children) {
      for (let i = 0; i < elm.children.length; i++) {
        styleTDTH(dom, elm.children[i], name, value);
      }
    }
  }
};

const applyModifiedDataToElement = (editor: Editor, tableElm: HTMLTableElement, modifiedData: ModifiedTableData): void => {
  const dom = editor.dom;
  const attrs: Record<string, string | number | null> = {};
  const styles: Record<string, string> = {};

  const shouldStyleWithCss = Options.shouldStyleWithCss(editor);
  const hasAdvancedTableTab = Options.hasAdvancedTableTab(editor);

  const isModifiedBackgroundColor = !Type.isUndefined(modifiedData.backgroundcolor);
  const isModifiedBorder = !Type.isUndefined(modifiedData.border);
  const isModifiedBorderColor = !Type.isUndefined(modifiedData.bordercolor);
  const isModifiedBorderStyle = !Type.isUndefined(modifiedData.borderstyle);
  const isModifiedCellPadding = !Type.isUndefined(modifiedData.cellpadding);
  const isModifiedCellSpacing = !Type.isUndefined(modifiedData.cellspacing);
  const isModifiedClass = !Type.isUndefined(modifiedData.class);
  const isModifiedHeight = !Type.isUndefined(modifiedData.height);
  const isModifiedWidth = !Type.isUndefined(modifiedData.width);

  if (isModifiedClass) {
    attrs.class = modifiedData.class;
  }

  if (isModifiedHeight) {
    styles.height = Utils.addPxSuffix(modifiedData.height);
  }

  if (isModifiedWidth) {
    if (shouldStyleWithCss) {
      styles.width = Utils.addPxSuffix(modifiedData.width);
    } else if (dom.getAttrib(tableElm, 'width')) {
      attrs.width = Utils.removePxSuffix(modifiedData.width);
    }
  }

  if (shouldStyleWithCss) {
    if (isModifiedBorder) {
      styles['border-width'] = Utils.addPxSuffix(modifiedData.border);
    }
    if (isModifiedCellSpacing) {
      styles['border-spacing'] = Utils.addPxSuffix(modifiedData.cellspacing);
    }
  } else {
    if (isModifiedBorder) {
      attrs.border = modifiedData.border;
    }
    if (isModifiedCellPadding) {
      attrs.cellpadding = modifiedData.cellpadding;
    }
    if (isModifiedCellSpacing) {
      attrs.cellspacing = modifiedData.cellspacing;
    }
  }

  // TODO: this has to be reworked somehow, for example by introducing dedicated option, which
  // will control whether child TD/THs should be processed or not
  if (shouldStyleWithCss && tableElm.children && (isModifiedBorder || isModifiedCellPadding || hasAdvancedTableTab && isModifiedBorderColor)) {
    for (let i = 0; i < tableElm.children.length; i++) {
      if (isModifiedBorder || isModifiedCellPadding) {
        const styles: StyleMap = {};
        if (isModifiedBorder) {
          styles['border-width'] = Utils.addPxSuffix(modifiedData.border);
        }
        if (isModifiedCellPadding) {
          styles.padding = Utils.addPxSuffix(modifiedData.cellpadding);
        }
        styleTDTH(dom, tableElm.children[i], styles);
      }
      if (hasAdvancedTableTab && isModifiedBorderColor) {
        styleTDTH(dom, tableElm.children[i], {
          'border-color': modifiedData.bordercolor
        });
      }
    }
  }

  if (hasAdvancedTableTab) {
    if (isModifiedBackgroundColor) {
      styles['background-color'] = modifiedData.backgroundcolor;
    }
    if (isModifiedBorderColor) {
      styles['border-color'] = modifiedData.bordercolor;
    }
    if (isModifiedBorderStyle) {
      styles['border-style'] = modifiedData.borderstyle;
    }
  }

  attrs.style = dom.serializeStyle({ ...Options.getDefaultStyles(editor), ...styles });
  dom.setAttribs(tableElm, { ...Options.getDefaultAttributes(editor), ...attrs });

};

const onSubmitTableForm = (editor: Editor, tableElm: HTMLTableElement | null | undefined, oldData: TableData, api: Dialog.DialogInstanceApi<TableData>): void => {
  const dom = editor.dom;
  const data = api.getData();
  const modifiedData: ModifiedTableData = Obj.filter(data, (value, key) => oldData[key as keyof TableData] !== value && (key !== 'class' || value !== ''));

  api.close();

  editor.undoManager.transact(() => {
    if (!tableElm) {
      const cols = Strings.toInt(data.cols as string).getOr(1);
      const rows = Strings.toInt(data.rows as string).getOr(1);
      // Cases 1 & 3 - inserting a table
      editor.execCommand('mceInsertTable', false, { rows, columns: cols });
      tableElm = TableSelection.getSelectionCell(Utils.getSelectionStart(editor), Utils.getIsRoot(editor))
        .bind((cell) => TableLookup.table(cell, Utils.getIsRoot(editor)))
        .map((table) => table.dom)
        .getOrDie();
    }

    if (Obj.size(modifiedData) > 0) {
      applyModifiedDataToElement(editor, tableElm, modifiedData);

      // Toggle caption on/off
      const captionElm = dom.select('caption', tableElm)[0];

      if (captionElm && !data.caption || !captionElm && data.caption) {
        editor.execCommand('mceTableToggleCaption');
      }

      Styles.setAlign(editor, tableElm, data.align);
    }

    editor.focus();
    editor.addVisual();

    if (Obj.size(modifiedData) > 0) {
      const captionModified = Obj.has(modifiedData, 'caption');
      // style modified if there's at least one other change apart from 'caption'
      const styleModified = captionModified ? Obj.size(modifiedData) > 1 : true;

      Events.fireTableModified(editor, tableElm, { structure: captionModified, style: styleModified });
    }
  });
};

const open = (editor: Editor, insertNewTable: boolean): void => {
  const dom = editor.dom;
  let tableElm: HTMLTableElement | null | undefined;
  let data = Helpers.extractDataFromSettings(editor, Options.hasAdvancedTableTab(editor));

  // Cases for creation/update of tables:
  // 1. isNew == true - called by mceInsertTable - we are inserting a new table so we don't care what the selection's parent is,
  //    and we need to add cols and rows input fields to the dialog
  // 2. isNew == false && selection parent is a table - update the table
  // 3. isNew == false && selection parent isn't a table - open dialog with default values and insert a table

  if (insertNewTable) {
    // Case 1 - isNew == true. We're inserting a new table so use defaults and add cols and rows + adv properties.
    data.cols = '1';
    data.rows = '1';
    if (Options.hasAdvancedTableTab(editor)) {
      data.borderstyle = '';
      data.bordercolor = '';
      data.backgroundcolor = '';
    }
  } else {
    tableElm = dom.getParent<HTMLTableElement>(editor.selection.getStart(), 'table', editor.getBody());
    if (tableElm) {
      // Case 2 - isNew == false && table parent
      data = Helpers.extractDataFromTableElement(editor, tableElm, Options.hasAdvancedTableTab(editor));
    } else {
      // Case 3 - isNew == false && non-table parent. data is set to basic defaults so just add the adv properties if needed
      if (Options.hasAdvancedTableTab(editor)) {
        data.borderstyle = '';
        data.bordercolor = '';
        data.backgroundcolor = '';
      }
    }
  }

  const classes = UiUtils.buildListItems(Options.getTableClassList(editor));

  if (classes.length > 0) {
    if (data.class) {
      data.class = data.class.replace(/\s*mce\-item\-table\s*/g, '');
    }
  }

  const generalPanel: Dialog.GridSpec = {
    type: 'grid',
    columns: 2,
    items: TableDialogGeneralTab.getItems(editor, classes, insertNewTable)
  };

  const nonAdvancedForm = (): Dialog.PanelSpec => ({
    type: 'panel',
    items: [ generalPanel ]
  });

  const advancedForm = (): Dialog.TabPanelSpec => ({
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
        items: [ generalPanel ]
      },
      getAdvancedTab(editor, 'table')
    ]
  });

  const dialogBody = Options.hasAdvancedTableTab(editor) ? advancedForm() : nonAdvancedForm();

  editor.windowManager.open({
    title: 'Table Properties',
    size: 'normal',
    body: dialogBody,
    onSubmit: Fun.curry(onSubmitTableForm, editor, tableElm, data),
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData: data
  });
};

export {
  open
};
