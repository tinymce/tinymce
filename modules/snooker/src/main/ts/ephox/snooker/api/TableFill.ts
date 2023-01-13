import { Arr, Obj, Optional } from '@ephox/katamari';
import { Attribute, Compare, Css, CursorPosition, Insert, Replication, SelectorFilter, SugarElement, SugarNode } from '@ephox/sugar';

import { CellElement } from '../util/TableTypes';
import { CellData, Generators, SimpleGenerators } from './Generators';

const transferableAttributes: Record<string, string[]> = {
  scope: [
    'row',
    'col'
  ]
};

// NOTE: This may create a td instead of a th, but it is for irregular table handling.
const createCell = (doc: SugarElement<Document>) => () => {
  const td = SugarElement.fromTag('td', doc.dom);
  Insert.append(td, SugarElement.fromTag('br', doc.dom));
  return td;
};

const createCol = (doc: SugarElement<Document>) => () => {
  return SugarElement.fromTag('col', doc.dom);
};

const createColgroup = (doc: SugarElement<Document>) => () => {
  return SugarElement.fromTag('colgroup', doc.dom);
};

const createRow = (doc: SugarElement<Document>) => () => {
  return SugarElement.fromTag('tr', doc.dom);
};

const replace = (cell: SugarElement<HTMLTableCellElement>, tag: 'td' | 'th', attrs: Record<string, string | number | boolean | null>) => {
  const replica = Replication.copy(cell, tag);
  // TODO: Snooker passes null to indicate 'remove attribute'
  Obj.each(attrs, (v, k) => {
    if (v === null) {
      Attribute.remove(replica, k);
    } else {
      Attribute.set(replica, k, v);
    }
  });
  return replica;
};

// eslint-disable-next-line @tinymce/prefer-fun
const pasteReplace = (cell: SugarElement<HTMLTableCellElement>) => {
  // TODO: check for empty content and don't return anything
  return cell;
};

const cloneFormats = (oldCell: SugarElement<Element>, newCell: SugarElement<Element>, formats: string[]) => {
  const first = CursorPosition.first(oldCell);
  return first.map((firstText) => {
    const formatSelector = formats.join(',');
    // Find the ancestors of the first text node that match the given formats.
    const parents = SelectorFilter.ancestors(firstText, formatSelector, (element) => {
      return Compare.eq(element, oldCell);
    });
    // Add the matched ancestors to the new cell, then return the new cell.
    return Arr.foldr(parents, (last, parent) => {
      const clonedFormat = Replication.shallow(parent);
      Insert.append(last, clonedFormat);
      return clonedFormat;
    }, newCell);
  }).getOr(newCell);
};

const cloneAppropriateAttributes = <T extends HTMLElement>(original: SugarElement<T>, clone: SugarElement<T>): void => {
  Obj.each(transferableAttributes, (validAttributes, attributeName) =>
    Attribute.getOpt(original, attributeName)
      .filter((attribute) => Arr.contains(validAttributes, attribute))
      .each((attribute) => Attribute.set(clone, attributeName, attribute))
  );
};

const cellOperations = (mutate: (e1: SugarElement<CellElement>, e2: SugarElement<CellElement>) => void, doc: SugarElement<Document>, formatsToClone: Optional<string[]>): Generators => {
  const cloneCss = <T extends HTMLElement> (prev: CellData, clone: SugarElement<T>) => {
    // inherit the style and width, dont inherit the row height
    Css.copy(prev.element, clone);
    Css.remove(clone, 'height');
    // dont inherit the width of spanning columns
    if (prev.colspan !== 1) {
      Css.remove(clone, 'width');
    }
  };

  const newCell = (prev: CellData) => {
    const td = SugarElement.fromTag(SugarNode.name(prev.element) as 'td' | 'th', doc.dom);

    const formats = formatsToClone.getOr([ 'strong', 'em', 'b', 'i', 'span', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' ]);

    // If we aren't cloning the child formatting, we can just give back the new td immediately.
    const lastNode = formats.length > 0 ? cloneFormats(prev.element, td, formats) : td;
    Insert.append(lastNode, SugarElement.fromTag('br'));

    cloneCss(prev, td);
    cloneAppropriateAttributes(prev.element, td);
    mutate(prev.element, td);
    return td;
  };

  const newCol = (prev: CellData) => {
    const col = SugarElement.fromTag(SugarNode.name(prev.element) as 'col', doc.dom);
    cloneCss(prev, col);
    mutate(prev.element, col);
    return col;
  };

  return {
    col: newCol,
    colgroup: createColgroup(doc),
    row: createRow(doc),
    cell: newCell,
    replace,
    colGap: createCol(doc),
    gap: createCell(doc)
  };
};

const paste = (doc: SugarElement<Document>): SimpleGenerators => {
  return {
    col: createCol(doc),
    colgroup: createColgroup(doc),
    row: createRow(doc),
    cell: createCell(doc),
    replace: pasteReplace,
    colGap: createCol(doc),
    gap: createCell(doc)
  };
};

export {
  cellOperations,
  paste
};
