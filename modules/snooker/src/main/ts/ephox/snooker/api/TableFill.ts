import { Arr, Obj, Option } from '@ephox/katamari';
import { Attr, Compare, Css, CursorPosition, Element, Insert, Node, Replication, SelectorFilter, Traverse } from '@ephox/sugar';
import { Generators, CellSpan, SimpleGenerators } from './Generators';
import { HTMLElementTagNameMap } from '@ephox/dom-globals';

// NOTE: This may create a td instead of a th, but it is for irregular table handling.
const createCell = function () {
  const td = Element.fromTag('td');
  Insert.append(td, Element.fromTag('br'));
  return td;
};

const replace = function <K extends keyof HTMLElementTagNameMap> (cell: Element, tag: K, attrs: Record<string, string | number | boolean | null>) {
  const replica = Replication.copy(cell, tag);
  // TODO: Snooker passes null to indicate 'remove attribute'
  Obj.each(attrs, function (v, k) {
    if (v === null) {
      Attr.remove(replica, k);
    } else {
      Attr.set(replica, k, v);
    }
  });
  return replica;
};

const pasteReplace = function (cell: Element) {
  // TODO: check for empty content and don't return anything
  return cell;
};

const newRow = function (doc: Element) {
  return function () {
    return Element.fromTag('tr', doc.dom());
  };
};

const cloneFormats = function (oldCell: Element, newCell: Element, formats: string[]) {
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
      Attr.remove(clonedFormat, 'contenteditable');
      Insert.append(last, clonedFormat);
      return clonedFormat;
    }, newCell);
  }).getOr(newCell);
};

const cellOperations = function (mutate: (e1: Element, e2: Element) => void, doc: Element, formatsToClone: Option<string[]>): Generators {
  const newCell = function (prev: CellSpan) {
    const docu = Traverse.owner(prev.element());
    const td = Element.fromTag(Node.name(prev.element()), docu.dom());

    const formats = formatsToClone.getOr([ 'strong', 'em', 'b', 'i', 'span', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' ]);

    // If we aren't cloning the child formatting, we can just give back the new td immediately.
    const lastNode = formats.length > 0 ? cloneFormats(prev.element(), td, formats) : td;

    Insert.append(lastNode, Element.fromTag('br'));
    // inherit the style and width, dont inherit the row height
    Css.copy(prev.element(), td);
    Css.remove(td, 'height');
    // dont inherit the width of spanning columns
    if (prev.colspan() !== 1) {
      Css.remove(prev.element(), 'width');
    }
    mutate(prev.element(), td);
    return td;
  };

  return {
    row: newRow(doc),
    cell: newCell,
    replace,
    gap: createCell
  };
};

const paste = function (doc: Element): SimpleGenerators {
  return {
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
