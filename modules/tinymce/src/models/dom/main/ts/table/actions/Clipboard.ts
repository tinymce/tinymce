import { Arr, Optional } from '@ephox/katamari';
import { CopySelected, TableFill, TableLookup } from '@ephox/snooker';
import { Attribute, Css, Insert, InsertAll, Remove, SugarElement, SugarElements, SugarNode, SugarShadowDom } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import * as Utils from '../core/TableUtils';
import * as TableTargets from '../queries/TableTargets';
import * as Ephemera from '../selection/Ephemera';
import * as TableSelection from '../selection/TableSelection';
import { TableActions } from './TableActions';

const extractSelected = (cells: SugarElement<HTMLTableCellElement>[]): Optional<SugarElement<HTMLTableElement>[]> => {
  // Assume for now that we only have one table (also handles the case where we multi select outside a table)
  return TableLookup.table(cells[0]).map(
    (table) => {
      const replica = CopySelected.extract(table, Ephemera.attributeSelector);
      Utils.removeDataStyle(replica);
      return [ replica ];
    }
  );
};

const serializeElements = (editor: Editor, elements: SugarElement<HTMLElement>[]): string =>
  Arr.map(elements, (elm) => editor.selection.serializer.serialize(elm.dom, {})).join('');

const getTextContent = (editor: Editor, replicaElements: SugarElement<HTMLTableElement>[]): string => {
  const doc = editor.getDoc();
  const dos = SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getBody()));

  // Set up offscreen div so that the extracted table element can be inserted into the DOM
  // TINY-10847: If the table element is detached from the DOM, calling innerText is equivalent to calling
  // textContent which does not include '\n' and '\t' characters to separate rows and cells respectively
  const offscreenDiv = SugarElement.fromTag('div', doc);
  Attribute.set(offscreenDiv, 'data-mce-bogus', 'all');
  Css.setAll(offscreenDiv, {
    position: 'fixed',
    left: '-9999999px',
    top: '0',
    overflow: 'hidden',
    opacity: '0'
  });
  const root = SugarShadowDom.getContentContainer(dos);
  InsertAll.append(offscreenDiv, replicaElements);
  Insert.append(root, offscreenDiv);

  const textContent = offscreenDiv.dom.innerText;

  Remove.remove(offscreenDiv);

  return textContent;
};

const registerEvents = (editor: Editor, actions: TableActions): void => {
  editor.on('BeforeGetContent', (e) => {
    const multiCellContext = (cells: SugarElement<HTMLTableCellElement>[]) => {
      e.preventDefault();
      extractSelected(cells).each((replicaElements) => {
        const content = e.format === 'text' ? getTextContent(editor, replicaElements) : serializeElements(editor, replicaElements);
        e.content = content;
      });
    };

    if (e.selection === true) {
      const cells = TableSelection.getCellsFromFakeSelection(editor);
      if (cells.length >= 1) {
        multiCellContext(cells);
      }
    }
  });

  editor.on('BeforeSetContent', (e) => {
    if (e.selection === true && e.paste === true) {
      const selectedCells = TableSelection.getCellsFromSelection(editor);
      Arr.head(selectedCells).each((cell) => {
        TableLookup.table(cell).each((table) => {

          const elements = Arr.filter(SugarElements.fromHtml(e.content), (content) => {
            return SugarNode.name(content) !== 'meta';
          });

          const isTable = SugarNode.isTag('table');
          if (Options.shouldMergeContentOnPaste(editor) && elements.length === 1 && isTable(elements[0])) {
            e.preventDefault();

            const doc = SugarElement.fromDom(editor.getDoc());
            const generators = TableFill.paste(doc);
            const targets = TableTargets.paste(cell, elements[0], generators);
            actions.pasteCells(table, targets).each(() => {
              editor.focus();
            });
          }
        });
      });
    }
  });
};

export { registerEvents };

