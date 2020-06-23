/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, HTMLTableRowElement } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Element } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { getTableHeaderType } from '../api/Settings';
import * as Util from '../alien/Util';

export interface HeaderRowConfiguration {
  thead: boolean;
  ths: boolean;
}

const getSection = (elm: HTMLTableRowElement) => Util.getNodeName(elm.parentNode);

const detectHeaderRow = (editor: Editor, elm: HTMLTableRowElement): Option<HeaderRowConfiguration> => {
  // Header rows can use a combination of theads and ths - want to detect the 3 combinations
  const isThead = getSection(elm) === 'thead';
  const areAllCellsThs = !Arr.exists(elm.cells, (c) => Util.getNodeName(c) !== 'th');

  if (isThead || areAllCellsThs) {
    return Option.some({ thead: isThead, ths: areAllCellsThs });
  }
  return Option.none();
};

const getRowType = (editor: Editor, elm: HTMLTableRowElement) => detectHeaderRow(editor, elm).fold(
  () => getSection(elm),
  (_rowConfig) => 'thead'
);

const switchRowSection = (dom: DOMUtils, rowElm: HTMLElement, newSectionName: string) => {
  const tableElm = dom.getParent(rowElm, 'table');
  const oldParentElm = rowElm.parentNode;
  let parentElm = dom.select(newSectionName, tableElm)[0];

  if (!parentElm) {
    parentElm = dom.create(newSectionName);
    const firstTableChild = tableElm.firstChild;
    if (firstTableChild) {
      // caption tag should be the first descendant of the table tag (see TINY-1167)
      if (Util.getNodeName(firstTableChild) === 'caption') {
        dom.insertAfter(parentElm, firstTableChild);
      } else {
        tableElm.insertBefore(parentElm, firstTableChild);
      }
    } else {
      tableElm.appendChild(parentElm);
    }
  }

  // If moving from the head to the body, add to the top of the body
  if (newSectionName === 'tbody' && Util.getNodeName(oldParentElm) === 'thead' && parentElm.firstChild) {
    parentElm.insertBefore(rowElm, parentElm.firstChild);
  } else {
    parentElm.appendChild(rowElm);
  }

  if (!oldParentElm.hasChildNodes()) {
    dom.remove(oldParentElm);
  }
};

const switchRowCellType = (dom: DOMUtils, rowElm: HTMLTableRowElement, newCellType: string) => {
  Arr.each(rowElm.cells, (c) => Util.getNodeName(c) !== newCellType ? dom.rename(c, newCellType): c);
};

const switchRowType = (editor: Editor, rowElm: HTMLTableRowElement, newType: string) => {
  const determineHeaderRowType = () => {
    // default if all else fails is thead > tr > tds aka 'thead' mode
    const allTableRows = TableLookup.table(Element.fromDom(rowElm.cells[0]))
      .map((table) => TableLookup.rows(table)).getOr([]);
    return Arr.find(allTableRows, (row: Element<HTMLTableRowElement>) => detectHeaderRow(editor, row.dom()).isSome()).map((detectedType) => {
      if (detectedType.thead && detectedType.ths) {
        return 'both';
      } else {
        return detectedType.thead ? 'thead' : 'ths';
      }
    }).getOr('thead');
  };

  const dom = editor.dom;

  if (newType === 'thead') {
    const headerRowTypeSetting = getTableHeaderType(editor);
    const headerRowType = headerRowTypeSetting === 'auto' ? determineHeaderRowType() : headerRowTypeSetting;
    if (headerRowType === 'ths') {
      switchRowCellType(dom, rowElm, 'th');
    } else if (headerRowType === 'both') {
      switchRowCellType(dom, rowElm, 'th');
      switchRowSection(dom, rowElm, 'thead');
    } else { // technically headerRowType === 'thead' case but also default behaviour
      switchRowSection(dom, rowElm, 'thead');
    }
  } else {
    switchRowCellType(dom, rowElm, 'td'); // if switching from header to other, may need to switch th to td
    switchRowSection(dom, rowElm, newType);
  }
};

export { getRowType, detectHeaderRow, switchRowType };

