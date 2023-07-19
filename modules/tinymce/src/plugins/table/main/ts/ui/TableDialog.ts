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

type TableData = Helpers.TableData;

interface ApplicableCellProperties {
  readonly border: boolean;
  readonly bordercolor: boolean;
  readonly cellpadding: boolean;
}

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

const applyDataToElement = (editor: Editor, tableElm: HTMLTableElement, data: TableData, shouldApplyOnCell: ApplicableCellProperties): void => {
  const dom = editor.dom;
  const attrs: Record<string, string | number | null> = {};
  const styles: StyleMap = {};

  const shouldStyleWithCss = Options.shouldStyleWithCss(editor);
  const hasAdvancedTableTab = Options.hasAdvancedTableTab(editor);

  if (!Type.isUndefined(data.class)) {
    attrs.class = data.class;
  }

  styles.height = Utils.addPxSuffix(data.height);

  if (shouldStyleWithCss) {
    styles.width = Utils.addPxSuffix(data.width);
  } else if (dom.getAttrib(tableElm, 'width')) {
    attrs.width = Utils.removePxSuffix(data.width);
  }

  if (shouldStyleWithCss) {
    styles['border-width'] = Utils.addPxSuffix(data.border);
    styles['border-spacing'] = Utils.addPxSuffix(data.cellspacing);
  } else {
    attrs.border = data.border;
    attrs.cellpadding = data.cellpadding;
    attrs.cellspacing = data.cellspacing;
  }

  // TINY-9837: Relevant data are applied on child TD/THs only if they have been modified since the previous dialog submission
  if (shouldStyleWithCss && tableElm.children) {
    const cellStyles: StyleMap = {};
    if (shouldApplyOnCell.border) {
      cellStyles['border-width'] = Utils.addPxSuffix(data.border);
    }
    if (shouldApplyOnCell.cellpadding) {
      cellStyles.padding = Utils.addPxSuffix(data.cellpadding);
    }
    if (hasAdvancedTableTab && shouldApplyOnCell.bordercolor) {
      cellStyles['border-color'] = (data as Required<TableData>).bordercolor;
    }
    if (!Obj.isEmpty(cellStyles)) {
      for (let i = 0; i < tableElm.children.length; i++) {
        styleTDTH(dom, tableElm.children[i], cellStyles);
      }
    }
  }

  if (hasAdvancedTableTab) {
    const advData = data as Required<TableData>;
    styles['background-color'] = advData.backgroundcolor;
    styles['border-color'] = advData.bordercolor;
    styles['border-style'] = advData.borderstyle;
  }

  dom.setStyles(tableElm, { ...Options.getDefaultStyles(editor), ...styles });
  dom.setAttribs(tableElm, { ...Options.getDefaultAttributes(editor), ...attrs });
};

const onSubmitTableForm = (editor: Editor, tableElm: HTMLTableElement | null | undefined, oldData: TableData, api: Dialog.DialogInstanceApi<TableData>): void => {
  const dom = editor.dom;
  const data = api.getData();
  const modifiedData = Obj.filter(data, (value, key) => oldData[key as keyof TableData] !== value);

  api.close();

  if (data.class === '') {
    delete data.class;
  }

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
      const applicableCellProperties: ApplicableCellProperties = {
        border: Obj.has(modifiedData, 'border'),
        bordercolor: Obj.has(modifiedData, 'bordercolor'),
        cellpadding: Obj.has(modifiedData, 'cellpadding')
      };

      applyDataToElement(editor, tableElm, data, applicableCellProperties);

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
