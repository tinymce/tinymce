import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Replication } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { CursorPosition } from '@ephox/sugar';

// NOTE: This may create a td instead of a th, but it is for irregular table handling.
var cell = function () {
  var td = Element.fromTag('td');
  Insert.append(td, Element.fromTag('br'));
  return td;
};

var replace = function (cell, tag, attrs) {
  var replica = Replication.copy(cell, tag);
  // TODO: Snooker passes null to indicate 'remove attribute'
  Obj.each(attrs, function (v, k) {
    if (v === null) Attr.remove(replica, k);
    else Attr.set(replica, k, v);
  });
  return replica;
};

var pasteReplace = function (cellContent) {
  // TODO: check for empty content and don't return anything
  return cellContent;
};

var newRow = function (doc) {
  return function () {
    return Element.fromTag('tr', doc.dom());
  };
};

var cloneFormats = function (oldCell, newCell, formats) {
  var first = CursorPosition.first(oldCell);
  return first.map(function (firstText) {
    var formatSelector = formats.join(',');
    // Find the ancestors of the first text node that match the given formats.
    var parents = SelectorFilter.ancestors(firstText, formatSelector, function (element) {
      return Compare.eq(element, oldCell);
    });
    // Add the matched ancestors to the new cell, then return the new cell.
    return Arr.foldr(parents, function (last, parent) {
      var clonedFormat = Replication.shallow(parent);
      Attr.remove(clonedFormat, 'contenteditable');
      Insert.append(last, clonedFormat);
      return clonedFormat;
    }, newCell);
  }).getOr(newCell);
};

var cellOperations = function (mutate, doc, formatsToClone) {
  var newCell = function (prev) {
    var doc = Traverse.owner(prev.element());
    var td = Element.fromTag(Node.name(prev.element()), doc.dom());

    var formats = formatsToClone.getOr(['strong', 'em', 'b', 'i', 'span', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div']);

    // If we aren't cloning the child formatting, we can just give back the new td immediately.
    var lastNode = formats.length > 0 ? cloneFormats(prev.element(), td, formats) : td;

    Insert.append(lastNode, Element.fromTag('br'))
    // inherit the style and width, dont inherit the row height
    Css.copy(prev.element(), td);
    Css.remove(td, 'height');
    // dont inherit the width of spanning columns
    if (prev.colspan() !== 1) Css.remove(prev.element(), 'width');
    mutate(prev.element(), td);
    return td;
  };

  return {
    row: newRow(doc),
    cell: newCell,
    replace: replace,
    gap: cell
  };
};

var paste = function (doc) {
  return {
    row: newRow(doc),
    cell: cell,
    replace: pasteReplace,
    gap: cell
  };
};

export default {
  cellOperations: cellOperations,
  paste: paste
};