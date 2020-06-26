/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Element } from '@ephox/dom-globals';
import { Fun, Type, Unicode } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import { StyleMap } from 'tinymce/core/api/html/Styles';
import * as InsertTable from '../actions/InsertTable';
import * as Styles from '../actions/Styles';
import { getDefaultAttributes, getDefaultStyles, getTableClassList, hasAdvancedTableTab, shouldStyleWithCss } from '../api/Settings';
import * as Util from '../core/Util';
import * as Helpers from './Helpers';
import * as TableDialogGeneralTab from './TableDialogGeneralTab';

type TableData = Helpers.TableData;

// Explore the layers of the table till we find the first layer of tds or ths
const styleTDTH = (dom: DOMUtils, elm: Element, name: string | StyleMap, value?: string | number) => {
  if (elm.tagName === 'TD' || elm.tagName === 'TH') {
    if (Type.isString(name)) {
      dom.setStyle(elm, name, value);
    } else {
      dom.setStyle(elm, name);
    }
  } else {
    if (elm.children) {
      for (let i = 0; i < elm.children.length; i++) {
        styleTDTH(dom, elm.children[i], name, value);
      }
    }
  }
};

const applyDataToElement = (editor: Editor, tableElm, data: TableData) => {
  const dom = editor.dom;
  const attrs: any = {};
  const styles: any = {};

  attrs.class = data.class;

  styles.height = Util.addPxSuffix(data.height);

  if (dom.getAttrib(tableElm, 'width') && !shouldStyleWithCss(editor)) {
    attrs.width = Util.removePxSuffix(data.width);
  } else {
    styles.width = Util.addPxSuffix(data.width);
  }

  if (shouldStyleWithCss(editor)) {
    styles['border-width'] = Util.addPxSuffix(data.border);
    styles['border-spacing'] = Util.addPxSuffix(data.cellspacing);
  } else {
    attrs.border = data.border;
    attrs.cellpadding = data.cellpadding;
    attrs.cellspacing = data.cellspacing;
  }

  // TODO: this has to be reworked somehow, for example by introducing dedicated option, which
  // will control whether child TD/THs should be processed or not
  if (shouldStyleWithCss(editor) && tableElm.children) {
    for (let i = 0; i < tableElm.children.length; i++) {
      styleTDTH(dom, tableElm.children[i], {
        'border-width': Util.addPxSuffix(data.border),
        'padding': Util.addPxSuffix(data.cellpadding)
      });
      if (hasAdvancedTableTab(editor)) {
        styleTDTH(dom, tableElm.children[i], {
          'border-color': data.bordercolor
        });
      }
    }
  }

  if (hasAdvancedTableTab(editor)) {
    styles['background-color'] = data.backgroundcolor;
    styles['border-color'] = data.bordercolor;
    styles['border-style'] = data.borderstyle;
  }

  attrs.style = dom.serializeStyle({ ...getDefaultStyles(editor), ...styles });
  dom.setAttribs(tableElm, { ...getDefaultAttributes(editor), ...attrs });
};

const onSubmitTableForm = (editor: Editor, tableElm: Element, api: Types.Dialog.DialogInstanceApi<TableData>) => {
  const dom = editor.dom;
  let captionElm;
  const data = api.getData();

  api.close();

  if (data.class === '') {
    delete data.class;
  }

  editor.undoManager.transact(() => {
    if (!tableElm) {
      const cols = parseInt(data.cols, 10) || 1;
      const rows = parseInt(data.rows, 10) || 1;
      // Cases 1 & 3 - inserting a table
      tableElm = InsertTable.insert(editor, cols, rows, 0, 0);
    }

    applyDataToElement(editor, tableElm, data);

    // Toggle caption on/off
    captionElm = dom.select('caption', tableElm)[0];

    if (captionElm && !data.caption) {
      dom.remove(captionElm);
    }

    if (!captionElm && data.caption) {
      captionElm = dom.create('caption');
      captionElm.innerHTML = !Env.ie ? '<br data-mce-bogus="1"/>' : Unicode.nbsp;
      tableElm.insertBefore(captionElm, tableElm.firstChild);
    }

    if (data.align === '') {
      Styles.unApplyAlign(editor, tableElm);
    } else {
      Styles.applyAlign(editor, tableElm, data.align);
    }

    editor.focus();
    editor.addVisual();
  });
};

const open = (editor: Editor, insertNewTable: boolean) => {
  const dom = editor.dom;
  let tableElm: Element;
  let data = Helpers.extractDataFromSettings(editor, hasAdvancedTableTab(editor));

  // Cases for creation/update of tables:
  // 1. isNew == true - called by mceInsertTable - we are inserting a new table so we don't care what the selection's parent is,
  //    and we need to add cols and rows input fields to the dialog
  // 2. isNew == false && selection parent is a table - update the table
  // 3. isNew == false && selection parent isn't a table - open dialog with default values and insert a table

  if (insertNewTable === false) {
    tableElm = dom.getParent(editor.selection.getStart(), 'table');
    if (tableElm) {
      // Case 2 - isNew == false && table parent
      data = Helpers.extractDataFromTableElement(editor, tableElm, hasAdvancedTableTab(editor));
    } else {
      // Case 3 - isNew == false && non-table parent. data is set to basic defaults so just add the adv properties if needed
      if (hasAdvancedTableTab(editor)) {
        data.borderstyle = '';
        data.bordercolor = '';
        data.backgroundcolor = '';
      }
    }
  } else {
    // Case 1 - isNew == true. We're inserting a new table so use defaults and add cols and rows + adv properties.
    data.cols = '1';
    data.rows = '1';
    if (hasAdvancedTableTab(editor)) {
      data.borderstyle = '';
      data.bordercolor = '';
      data.backgroundcolor = '';
    }
  }

  const classes = Helpers.buildListItems(getTableClassList(editor));

  if (classes.length > 0) {
    if (data.class) {
      data.class = data.class.replace(/\s*mce\-item\-table\s*/g, '');
    }
  }

  const generalPanel: Types.Dialog.BodyComponentApi = {
    type: 'grid',
    columns: 2,
    items: TableDialogGeneralTab.getItems(editor, classes, insertNewTable)
  };

  const nonAdvancedForm = (): Types.Dialog.PanelApi => ({
    type: 'panel',
    items: [ generalPanel ]
  });

  const advancedForm = (): Types.Dialog.TabPanelApi => ({
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
        items: [ generalPanel ]
      },
      Helpers.getAdvancedTab('table')
    ]
  });

  const dialogBody = hasAdvancedTableTab(editor) ? advancedForm() : nonAdvancedForm();

  editor.windowManager.open({
    title: 'Table Properties',
    size: 'normal',
    body: dialogBody,
    onSubmit: Fun.curry(onSubmitTableForm, editor, tableElm),
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
