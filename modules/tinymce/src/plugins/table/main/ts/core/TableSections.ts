/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Type } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { SelectorFilter, SugarElement } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import * as Events from '../api/Events';
import { getTableHeaderType } from '../api/Settings';
import * as Util from './Util';

export interface HeaderRowConfiguration {
  thead: boolean;
  ths: boolean;
}

const getSection = (elm: HTMLTableRowElement): string => Util.getNodeName(elm.parentNode);

const mapSectionNameToType = (section: string): 'header' | 'footer' | 'body' => {
  if (section === 'thead') {
    return 'header';
  } else if (section === 'tfoot') {
    return 'footer';
  } else {
    // might as well default to body
    return 'body';
  }
};

const detectHeaderRow = (editor: Editor, elm: HTMLTableRowElement): Optional<HeaderRowConfiguration> => {
  // Header rows can use a combination of theads and ths - want to detect the 3 combinations
  const isThead = getSection(elm) === 'thead';
  const areAllCellsThs = !Arr.exists(elm.cells, (c) => Util.getNodeName(c) !== 'th');

  return isThead || areAllCellsThs ? Optional.some({ thead: isThead, ths: areAllCellsThs }) : Optional.none();
};

const getRowType = (editor: Editor, elm: HTMLTableRowElement) => mapSectionNameToType(detectHeaderRow(editor, elm).fold(
  () => getSection(elm),
  (_rowConfig) => 'thead'
));

const switchRowSection = (dom: DOMUtils, rowElm: HTMLElement, newSectionName: string) => {
  const tableElm = dom.getParent(rowElm, 'table');
  const oldSectionElm = rowElm.parentNode;
  const oldSectionName = Util.getNodeName(oldSectionElm);

  // Skip e.g. if old type was thead but it was configured as tbody > tr > th, and we're switching to tbody
  if (newSectionName !== oldSectionName) {
    let sectionElm = dom.select(newSectionName, tableElm)[0];

    if (!sectionElm) {
      sectionElm = dom.create(newSectionName);
      const firstTableChild = tableElm.firstChild;

      if (newSectionName === 'thead') {
        Arr.last(SelectorFilter.children(SugarElement.fromDom(tableElm), 'caption,colgroup')).fold(
          () => tableElm.insertBefore(sectionElm, firstTableChild),
          (c) => dom.insertAfter(sectionElm, c.dom)
        );
      } else {
        tableElm.appendChild(sectionElm);
      }
    }

    // If moving from the head to the body, add to the top of the body
    if (newSectionName === 'tbody' && oldSectionName === 'thead' && sectionElm.firstChild) {
      sectionElm.insertBefore(rowElm, sectionElm.firstChild);
    } else {
      sectionElm.appendChild(rowElm);
    }

    if (!oldSectionElm.hasChildNodes()) {
      dom.remove(oldSectionElm);
    }
  }
};

const renameCell = (editor: Editor, cell: HTMLTableCellElement, newCellType?: 'td' | 'th'): HTMLTableCellElement => {
  if (Type.isNonNullable(newCellType) && Util.getNodeName(cell) !== newCellType) {
    const newCellElm = editor.dom.rename(cell, newCellType) as HTMLTableCellElement;
    Events.fireNewCell(editor, newCellElm);
    return newCellElm;
  } else {
    return cell;
  }
};

const switchCellType = (editor: Editor, cell: HTMLTableCellElement, newCellType?: 'td' | 'th', scope?: 'col' | null): HTMLTableCellElement => {
  const dom = editor.dom;
  const newCell = renameCell(editor, cell, newCellType);
  if (!Type.isUndefined(scope)) {
    dom.setAttrib(newCell, 'scope', scope); // mutates
  }
  return newCell;
};

const switchCellsType = (editor: Editor, cells: ArrayLike<HTMLTableCellElement>, newCellType?: 'td' | 'th', scope?: 'col' | null) =>
  Arr.each(cells, (c) => switchCellType(editor, c, newCellType, scope));

const switchSectionType = (editor: Editor, rowElm: HTMLTableRowElement, newType: string) => {
  const determineHeaderRowType = (): 'section' | 'cells' | 'sectionCells' => {
    // default if all else fails is thead > tr > tds aka 'section' mode
    const allTableRows = TableLookup.table(SugarElement.fromDom(rowElm.cells[0]))
      .map((table) => TableLookup.rows(table)).getOr([]);
    return Arr.findMap<SugarElement<HTMLTableRowElement>, HeaderRowConfiguration>(allTableRows, (row) => detectHeaderRow(editor, row.dom)).map((detectedType) => {
      if (detectedType.thead && detectedType.ths) {
        return 'sectionCells';
      } else {
        return detectedType.thead ? 'section' : 'cells';
      }
    }).getOr('section');
  };

  const dom = editor.dom;

  if (newType === 'header') {
    const headerRowTypeSetting = getTableHeaderType(editor);
    const headerRowType = headerRowTypeSetting === 'auto' ? determineHeaderRowType() : headerRowTypeSetting;

    // We're going to always enforce the right td/th and thead/tbody/tfoot type.
    // switchRowSection will short circuit if not necessary to save computation
    switchCellsType(editor, rowElm.cells, headerRowType === 'section' ? 'td' : 'th', 'col');
    switchRowSection(dom, rowElm, headerRowType === 'cells' ? 'tbody' : 'thead');
  } else {
    switchCellsType(editor, rowElm.cells, 'td', null); // if switching from header to other, may need to switch th to td
    switchRowSection(dom, rowElm, newType === 'footer' ? 'tfoot' : 'tbody');
  }
};

export { getRowType, detectHeaderRow, switchCellType, switchCellsType, switchSectionType };

