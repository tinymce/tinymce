/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections, SelectionTypes } from '@ephox/darwin';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { CopySelected, TableFill, TableLookup } from '@ephox/snooker';
import { Replication, SugarElement, SugarElements, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as TableTargets from '../queries/TableTargets';
import * as Ephemera from '../selection/Ephemera';
import { TableActions } from './TableActions';

const extractSelected = function (cells) {
  // Assume for now that we only have one table (also handles the case where we multi select outside a table)
  return TableLookup.table(cells[0]).map(Replication.deep).map(function (replica) {
    return [ CopySelected.extract(replica, Ephemera.attributeSelector) ];
  });
};

const serializeElements = (editor: Editor, elements: SugarElement[]): string => Arr.map(elements, (elm) => editor.selection.serializer.serialize(elm.dom, {})).join('');

const getTextContent = (elements: SugarElement[]): string => Arr.map(elements, (element) => element.dom.innerText).join('');

const registerEvents = function (editor: Editor, selections: Selections, actions: TableActions, cellSelection) {
  editor.on('BeforeGetContent', function (e) {
    const multiCellContext = function (cells) {
      e.preventDefault();
      extractSelected(cells).each(function (elements) {
        e.content = e.format === 'text' ? getTextContent(elements) : serializeElements(editor, elements);
      });
    };

    if (e.selection === true) {
      SelectionTypes.cata(selections.get(), Fun.noop, multiCellContext, Fun.noop);
    }
  });

  editor.on('BeforeSetContent', function (e) {
    if (e.selection === true && e.paste === true) {
      const cellOpt = Optional.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      cellOpt.each(function (domCell) {
        const cell = SugarElement.fromDom(domCell);
        TableLookup.table(cell).each((table) => {

          const elements = Arr.filter(SugarElements.fromHtml(e.content), function (content) {
            return SugarNode.name(content) !== 'meta';
          });

          const isTable = (elm: SugarElement<Node>): elm is SugarElement<HTMLTableElement> => SugarNode.name(elm) === 'table';
          if (elements.length === 1 && isTable(elements[0])) {
            e.preventDefault();

            const doc = SugarElement.fromDom(editor.getDoc());
            const generators = TableFill.paste(doc);
            const targets = TableTargets.paste(cell, elements[0], generators);
            actions.pasteCells(table, targets).each(function (rng) {
              editor.selection.setRng(rng);
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

