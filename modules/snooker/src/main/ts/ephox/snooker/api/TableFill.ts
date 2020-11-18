import { Arr, Obj, Optional } from '@ephox/katamari';
import { Attribute, Compare, Css, CursorPosition, Insert, Replication, SelectorFilter, SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import { CellSpan, Generators, SimpleGenerators } from './Generators';

const transferableAttributes: Record<string, string[]> = {
  scope: [
    'row',
    'col'
  ]
};

// NOTE: This may create a td instead of a th, but it is for irregular table handling.
const createCell = function () {
  const td = SugarElement.fromTag('td');
  Insert.append(td, SugarElement.fromTag('br'));
  return td;
};

const createCol = () => SugarElement.fromTag('col');

const createColgroup = () => SugarElement.fromTag('colgroup');

const replace = function <K extends keyof HTMLElementTagNameMap> (cell: SugarElement, tag: K, attrs: Record<string, string | number | boolean | null>) {
  const replica = Replication.copy(cell, tag);
  // TODO: Snooker passes null to indicate 'remove attribute'
  Obj.each(attrs, function (v, k) {
    if (v === null) {
      Attribute.remove(replica, k);
    } else {
      Attribute.set(replica, k, v);
    }
  });
  return replica;
};

const pasteReplace = function (cell: SugarElement) {
  // TODO: check for empty content and don't return anything
  return cell;
};

const newRow = function (doc: SugarElement) {
  return function () {
    return SugarElement.fromTag('tr', doc.dom);
  };
};

const cloneFormats = function (oldCell: SugarElement, newCell: SugarElement, formats: string[]) {
  const first = CursorPosition.first(oldCell);
  return first.map(function (firstText) {
    const formatSelector = formats.join(',');
    // Find the ancestors of the first text node that match the given formats.
    const parents = SelectorFilter.ancestors(firstText, formatSelector, function (element) {
      return Compare.eq(element, oldCell);
    });
    // Add the matched ancestors to the new cell, then return the new cell.
    return Arr.foldr(parents, function (last, parent) {
      const clonedFormat = Replication.shallow(parent);
      Attribute.remove(clonedFormat, 'contenteditable');
      Insert.append(last, clonedFormat);
      return clonedFormat;
    }, newCell);
  }).getOr(newCell);
};

const cloneAppropriateAttributes = <T extends HTMLElement> (original: SugarElement<T>, clone: SugarElement<T>): void => {
  Obj.each(transferableAttributes, (validAttributes, attributeName) =>
    Attribute.getOpt(original, attributeName)
      .filter((attribute) => Arr.contains(validAttributes, attribute))
      .each((attribute) => Attribute.set(clone, attributeName, attribute))
  );
};

const cellOperations = function (mutate: (e1: SugarElement, e2: SugarElement) => void, doc: SugarElement, formatsToClone: Optional<string[]>): Generators {
  const cloneCss = <T extends HTMLElement> (prev: CellSpan, clone: SugarElement<T>) => {
    // inherit the style and width, dont inherit the row height
    Css.copy(prev.element, clone);
    Css.remove(clone, 'height');
    // dont inherit the width of spanning columns
    if (prev.colspan !== 1) {
      Css.remove(prev.element, 'width');
    }
  };

  const newCell = function (prev: CellSpan) {
    const docu = Traverse.owner(prev.element);
    const td = SugarElement.fromTag(SugarNode.name(prev.element) as 'td' | 'th', docu.dom);

    const formats = formatsToClone.getOr([ 'strong', 'em', 'b', 'i', 'span', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' ]);

    // If we aren't cloning the child formatting, we can just give back the new td immediately.
    const lastNode = formats.length > 0 ? cloneFormats(prev.element, td, formats) : td;
    Insert.append(lastNode, SugarElement.fromTag('br'));

    cloneCss(prev, td);
    cloneAppropriateAttributes(prev.element, td);
    mutate(prev.element, td);
    return td;
  };

  const newCol = (prev: CellSpan) => {
    const doc = Traverse.owner(prev.element);
    const col = SugarElement.fromTag(SugarNode.name(prev.element) as 'col', doc.dom);
    cloneCss(prev, col);
    mutate(prev.element, col);
    return col;
  };

  return {
    col: newCol,
    colgroup: createColgroup,
    row: newRow(doc),
    cell: newCell,
    replace,
    gap: createCell
  };
};

const paste = function (doc: SugarElement): SimpleGenerators {
  return {
    col: createCol,
    colgroup: createColgroup,
    row: newRow(doc),
    cell: createCell,
    replace: pasteReplace,
    gap: createCell
  };
};

export {
  cellOperations,
  paste
};
