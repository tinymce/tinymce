/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option } from '@ephox/katamari';
import { CopySelected, TableFill, TableLookup } from '@ephox/snooker';
import { Element, Elements, Node, Replication } from '@ephox/sugar';

import TableTargets from '../queries/TableTargets';
import Ephemera from '../selection/Ephemera';
import SelectionTypes from '../selection/SelectionTypes';
import { Editor } from 'tinymce/core/api/Editor';
import { TableActions } from 'tinymce/plugins/table/actions/TableActions';
import { Selections } from 'tinymce/plugins/table/selection/Selections';

const extractSelected = function (cells) {
  // Assume for now that we only have one table (also handles the case where we multi select outside a table)
  return TableLookup.table(cells[0]).map(Replication.deep).map(function (replica) {
    return [ CopySelected.extract(replica, Ephemera.attributeSelector()) ];
  });
};

const serializeElements = (editor: Editor, elements: Element[]): string => {
  return Arr.map(elements, (elm) => editor.selection.serializer.serialize(elm.dom(), {})).join('');
};

const getTextContent = (elements: Element[]): string => {
  return Arr.map(elements, (element) => element.dom().innerText).join('');
};

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
      const cellOpt = Option.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      cellOpt.each(function (domCell) {
        const cell = Element.fromDom(domCell);
        const table = TableLookup.table(cell);
        table.bind(function (table) {

          const elements = Arr.filter(Elements.fromHtml(e.content), function (content) {
            return Node.name(content) !== 'meta';
          });

          if (elements.length === 1 && Node.name(elements[0]) === 'table') {
            e.preventDefault();

            const doc = Element.fromDom(editor.getDoc());
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

export default {
  registerEvents
};