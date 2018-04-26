/**
 * Clipboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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

const serializeElement = function (editor: Editor, elm) {
  return editor.selection.serializer.serialize(elm.dom(), {});
};

const registerEvents = function (editor: Editor, selections: Selections, actions: TableActions, cellSelection) {
  editor.on('BeforeGetContent', function (e) {
    const multiCellContext = function (cells) {
      e.preventDefault();
      extractSelected(cells).each(function (elements) {
        e.content = Arr.map(elements, function (elm) {
          return serializeElement(editor, elm);
        }).join('');
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