import AriaRegister from './AriaRegister';
import Styles from './Styles';
import { Id } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';

var help = Struct.immutable('help', 'ids');

var base = function (element, label) {
  Attr.setAll(element, {
    'role': 'grid',
    'aria-label': label
  });
};

var row = function (element) {
  Attr.set(element, 'role', 'row');
};

// gridcell with explicit label
var cell = function (element, label) {
  gridcell(element);
  Attr.set(element, 'aria-label', label);
};

// gridcell with implicit label
var gridcell = function (element) {
  Attr.set(element,'role', 'gridcell');
};

var createHelp = function (rows, cols, translations) {
  var gridHelp = Element.fromTag('div');
  AriaRegister.presentation(gridHelp);
  Class.add(gridHelp, Styles.resolve('aria-help'));

  var colIds = [];
  // TODO: snooker util.repeat instead of mutation
  for (var colHelp = 0; colHelp < cols; colHelp++) {
    // Temporary non-random number until we get it right
    var colId = Id.generate('ephox-aria');
    var cellHelp = Element.fromTag('span');
    AriaRegister.presentation(cellHelp);
    Attr.set(cellHelp, 'id', colId);
    Class.add(cellHelp, Styles.resolve('aria-help'));
    Insert.append(cellHelp, Element.fromText(translations.col(colHelp + 1)));
    Insert.append(gridHelp, cellHelp);

    colIds[colHelp] = colId;
  }

  // TODO: snooker util.repeat instead of mutation
  var ids = [];
  for (var rowNum = 0; rowNum < rows; rowNum++) {
    // Temporary non-random number until we get it right
    var rowId = Id.generate('ephox-aria');
    var rowHelp = Element.fromTag('span');
    AriaRegister.presentation(rowHelp);
    Attr.set(rowHelp, 'id', rowId);
    Class.add(rowHelp, Styles.resolve('aria-help'));
    Insert.append(rowHelp, Element.fromText(translations.row(rowNum + 1)));
    Insert.append(gridHelp, rowHelp);

    ids[rowNum] = [];
    // TODO: snooker util.repeat instead of mutation
    for (var colNum = 0; colNum < cols; colNum++) {
      ids[rowNum][colNum] = colIds[colNum] + ' ' + rowId;
    }

  }
  return help(gridHelp, ids);
};

export default <any> {
  base: base,
  row: row,
  cell: cell,
  gridcell: gridcell,
  createHelp: createHelp
};