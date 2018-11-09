/**
 * CellDialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { HTMLTableCellElement, Node } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Styles from '../actions/Styles';
import * as Util from '../alien/Util';
import { hasAdvancedCellTab } from '../api/Settings';
import CellDialogGeneralTab from './CellDialogGeneralTab';
import Helpers, { CellData } from './Helpers';
import DomModifiers from './DomModifiers';

const updateSimpleProps = (modifiers, data: CellData) => {
  modifiers.setAttrib('scope', data.scope);
  modifiers.setAttrib('class', data.class);
  modifiers.setStyle('width', Util.addSizeSuffix(data.width));
  modifiers.setStyle('height', Util.addSizeSuffix(data.height));
};

const updateAdvancedProps = (modifiers, data: CellData) => {
  modifiers.setStyle('background-color', data.backgroundcolor);
  modifiers.setStyle('border-color', data.bordercolor);
  modifiers.setStyle('border-style', data.borderstyle);
};

// When applying to a single cell, values can be falsy. That is
// because there should be a consistent value across the cell
// selection, so it should also be possible to toggle things off.
const applyToSingle = (editor, cells: Node[], data: CellData) => {
  // NOTE: cells instead of cellElm passed through here just to keep signature
  // same as applyToMultiple. Probably change.
  // let cellElm = cells[0] as HTMLTableCellElement;
  const dom = editor.dom;

  // Switch cell type
  const cellElm: HTMLTableCellElement = data.celltype && cells[0].nodeName.toLowerCase() !== data.celltype ? dom.rename(cells[0], data.celltype) : cells[0];

  const modifiers = DomModifiers.normal(dom, cellElm);

  updateSimpleProps(modifiers, data);

  if (hasAdvancedCellTab(editor)) {
    updateAdvancedProps(modifiers, data);
  }

  // Remove alignment
  Styles.unApplyAlign(editor, cellElm);
  Styles.unApplyVAlign(editor, cellElm);

  // Apply alignment
  if (data.halign) {
    Styles.applyAlign(editor, cellElm, data.halign);
  }

  // Apply vertical alignment
  if (data.valign) {
    Styles.applyVAlign(editor, cellElm, data.valign);
  }
};

// When applying to multiple cells, values must be truthy to be set.
// This is because multiple cells might have different values, and you
// don't want a blank value to wipe out their original values. Note,
// how as part of this, it doesn't remove any original alignment before
// applying any specified alignment.
const applyToMultiple = (editor, cells: Node[], data: CellData) => {
  const dom = editor.dom;

  Tools.each(cells, (cellElm: HTMLTableCellElement) => {
    // Switch cell type
    if (data.celltype && cellElm.nodeName.toLowerCase() !== data.celltype) {
      cellElm = dom.rename(cellElm, data.celltype) as HTMLTableCellElement;
    }

    // NOTE: This isn't tested at all.
    const modifiers = DomModifiers.ifTruthy(dom, cellElm);

    updateSimpleProps(modifiers, data);

    if (hasAdvancedCellTab(editor)) {
      updateAdvancedProps(modifiers, data);
    }

    // Apply alignment
    if (data.halign) {
      Styles.applyAlign(editor, cellElm, data.halign);
    }

    // Apply vertical alignment
    if (data.valign) {
      Styles.applyVAlign(editor, cellElm, data.valign);
    }
  });
};

const onSubmitCellForm = (editor: Editor, cells: Node[], api) => {
  const data = api.getData();
  api.close();

  editor.undoManager.transact(() => {
    const applicator = cells.length === 1 ? applyToSingle : applyToMultiple;
    applicator(editor, cells, data);
    editor.focus();
  });
};

const open = (editor: Editor) => {
  let cellElm, cells = [];

  // Get selected cells or the current cell
  cells = editor.dom.select('td[data-mce-selected],th[data-mce-selected]');
  cellElm = editor.dom.getParent(editor.selection.getStart(), 'td,th');
  if (!cells.length && cellElm) {
    cells.push(cellElm);
  }

  cellElm = cellElm || cells[0];

  if (!cellElm) {
    // If this element is null, return now to avoid crashing.
    return;
  }

  // Get current data and find shared values between cells
  const cellsData: CellData[] = Tools.map(cells,
    (cellElm) => Helpers.extractDataFromCellElement(editor, cellElm, hasAdvancedCellTab(editor))
  );
  const data: CellData = Helpers.getSharedValues(cellsData);

  const body = hasAdvancedCellTab(editor) ?
    {
      type: 'tabpanel',
      tabs: [
        CellDialogGeneralTab.tab(editor),
        Helpers.getAdvancedTab()
      ]
    } : {
      type: 'panel',
      items: [
        CellDialogGeneralTab.tab(editor),
      ]
    };

  editor.windowManager.open({
    title: 'Cell Properties',
    size: 'normal',
    body,
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
    initialData: data,
    onSubmit: Fun.curry(onSubmitCellForm, editor, cells)
  });
};

export default {
  open
};