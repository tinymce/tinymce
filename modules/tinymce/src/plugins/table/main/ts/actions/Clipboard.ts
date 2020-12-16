/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections, SelectionTypes } from '@ephox/darwin';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { CopySelected, TableFill, TableLookup } from '@ephox/snooker';
import { SugarElement, SugarElements, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Util from '../core/Util';
import * as TableTargets from '../queries/TableTargets';
import * as Ephemera from '../selection/Ephemera';
import { TableActions } from './TableActions';

const extractSelected = (cells: SugarElement<HTMLTableCellElement>[]) => {
  // Assume for now that we only have one table (also handles the case where we multi select outside a table)
  return TableLookup.table(cells[0]).map(
    (table) => {
      const replica = CopySelected.extract(table, Ephemera.attributeSelector);
      Util.removeDataStyle(replica);
      return [ replica ];
    }
  );
};

const serializeElements = (editor: Editor, elements: SugarElement[]): string => Arr.map(elements, (elm) => editor.selection.serializer.serialize(elm.dom, {})).join('');

const getTextContent = (elements: SugarElement[]): string => Arr.map(elements, (element) => element.dom.innerText).join('');

const registerEvents = (editor: Editor, selections: Selections, actions: TableActions, cellSelection) => {
  editor.on('BeforeGetContent', (e) => {
    const multiCellContext = (cells) => {
      e.preventDefault();
      extractSelected(cells).each((elements) => {
        e.content = e.format === 'text' ? getTextContent(elements) : serializeElements(editor, elements);
      });
    };

    if (e.selection === true) {
      SelectionTypes.cata(selections.get(), Fun.noop, multiCellContext, Fun.noop);
    }
  });

  editor.on('BeforeSetContent', (e) => {
    if (e.selection === true && e.paste === true) {
      const cellOpt = Optional.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      cellOpt.each((domCell) => {
        const cell = SugarElement.fromDom(domCell);
        TableLookup.table(cell).each((table) => {

          const elements = Arr.filter(SugarElements.fromHtml(e.content), (content) => {
            return SugarNode.name(content) !== 'meta';
          });

          const isTable = (elm: SugarElement<Node>): elm is SugarElement<HTMLTableElement> => SugarNode.name(elm) === 'table';
          if (elements.length === 1 && isTable(elements[0])) {
            e.preventDefault();

            const doc = SugarElement.fromDom(editor.getDoc());
            const generators = TableFill.paste(doc);
            const targets = TableTargets.paste(cell, elements[0], generators);
            actions.pasteCells(table, targets).each((data) => {
              editor.selection.setRng(data.rng);
              editor.focus();
              cellSelection.clear(table);
            });
          }
        });
      });
    }
  });
};

export { registerEvents };

