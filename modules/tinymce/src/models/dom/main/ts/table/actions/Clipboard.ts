import { Arr, Optional } from '@ephox/katamari';
import { CopySelected, TableFill, TableLookup } from '@ephox/snooker';
import { SugarElement, SugarElements, SugarNode } from '@ephox/sugar';
import * as d3 from 'd3-dsv';

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

const getTextContent = (elements: SugarElement<HTMLElement>[]): string =>
  Arr.map(elements, (element) => element.dom.innerText).join('');

const isSpecialTable = (content: string): boolean => {
  return content.includes(',') || content.includes('\t');
};

const parseSpecialTable = (content: string): d3.DSVParsedArray<d3.DSVRowString<string>> | null => {
  const delimiter = content.includes('\t') ? '\t' : ',';
  const parser = delimiter === '\t' ? d3.tsvParse : d3.csvParse;

  console.log('delimiter', delimiter)
  try {
    const parsedData = parser(content);
    return parsedData;
  } catch (e) {
    console.log('Error parsing table', e);
    return null;
  }
};

const registerEvents = (editor: Editor, actions: TableActions): void => {
  editor.on('BeforeGetContent', (e) => {
    const multiCellContext = (cells: SugarElement<HTMLTableCellElement>[]) => {
      e.preventDefault();
      extractSelected(cells).each((elements) => {
        e.content = e.format === 'text' ? getTextContent(elements) : serializeElements(editor, elements);
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
      console.log('selectedCells', selectedCells);
      console.log('e.content', e.content);
      Arr.head(selectedCells).each((cell) => {
        TableLookup.table(cell).each((table) => {
          const elements = Arr.filter(SugarElements.fromHtml(e.content), (content) => {
            return SugarNode.name(content) !== 'meta';
          });

          const isTable = SugarNode.isTag('table');
          console.log('test', e.content);
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
      if (isSpecialTable(e.content)) {
        console.log('isSpecialTable')
        const parsedData = parseSpecialTable(e.content);
        console.log('parsedData', parsedData);
        if (parsedData?.columns) {
          const tableHtml = Utils.convertToTable(parsedData.columns);
          e.content = tableHtml;
        }
      }
    }
  });
};

export { registerEvents };

