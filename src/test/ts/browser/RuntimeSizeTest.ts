import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import RuntimeSize from 'ephox/snooker/resize/RuntimeSize';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Body } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('Runtime Size Test', function() {
  var platform = PlatformDetection.detect();

  var random = function (min, max) {
    return Math.round(Math.random() * (max - min) + min);
  };

  var getOuterWidth = function (elm) {
    return Math.round(elm.dom().getBoundingClientRect().width);
  };

  var getOuterHeight = function (elm) {
    return Math.round(elm.dom().getBoundingClientRect().height);
  };

  var measureCells = function (getSize, table) {
    return Arr.map(SelectorFilter.descendants(table, 'td'), getSize);
  };

  var measureTable = function (table, getSize) {
    return {
      total: getSize(table),
      cells: measureCells(getSize, table)
    };
  };

  var setWidth = function (table, value) {
    Css.set(table, 'width', value);
  };

  var setHeight = function (table, value) {
    Css.set(table, 'height', value);
  };

  var resizeTableBy = function (table, setSize, tableInfo, delta) {
    setSize(table, '');
    Arr.map(SelectorFilter.descendants(table, 'td'), function (cell, i) {
      setSize(cell, (tableInfo.cells[i] + delta) + 'px');
    });
  };

  var fuzzyAssertEq = function (a, b, msg) {
    // Sometimes the widths of the cells are 1 px off due to rounding but the total table width is never off
    assert.eq(true, Math.abs(a - b) <= 1, msg);
  };

  var assertSize = function (s1, table, getOuterSize, message) {
    var s2 = measureTable(table, getOuterSize);
    var html = Html.getOuter(table);
    var cellAssertEq = platform.browser.isIE() || platform.browser.isEdge() ? fuzzyAssertEq : assert.eq;

    assert.eq(s1.total, s2.total, message + ', expected table size: ' + s1.total + ', actual: ' + s2.total + ', table: ' + html);

    Arr.each(s1.cells, function (cz1, i) {
      var cz2 = s2.cells[i];
      cellAssertEq(cz1, cz2, message + ', expected cell size: ' + cz1 + ', actual: ' + cz2 + ', table: ' + html);
    });
  };

  var randomValue = function (values) {
    var idx = random(0, values.length - 1);
    return values[idx];
  };

  var randomSize = function (min, max) {
    var n = random(min, max);
    return n > 0 ? n + 'px' : '0';
  };

  var randomBorder = function (min, max, color) {
    var n = random(min, max);
    return n > 0 ? n + 'px solid ' + color : '0';
  };

  var createTableH = function () {
    var table = Element.fromTag('table');
    var tbody = Element.fromTag('tbody');
    var tr = Element.fromTag('tr');

    Attr.set(table, 'border', '1');
    Attr.set(table, 'cellpadding', random(0, 10).toString());
    Attr.set(table, 'cellspacing', random(0, 10).toString());

    Css.setAll(table, {
      'border-collapse': randomValue(['collapse', 'separate']),
      'border-left': randomBorder(0, 5, 'red'),
      'border-right': randomBorder(0, 5, 'red'),
      'width': randomSize(100, 1000)
    });

    var cells = Arr.range(random(1, 5), function (_) {
      var cell = Element.fromTag('td');

      Css.setAll(cell, {
        'width': randomSize(1, 100),
        'height': '10px',
        'padding-left': randomSize(0, 5),
        'padding-right': randomSize(0, 5),
        'border-left': randomBorder(0, 5, 'green'),
        'border-right': randomBorder(0, 5, 'green')
      });

      var content = Element.fromTag('div');

      Css.setAll(content, {
        'width': randomSize(1, 200),
        'height': '10px'
      });

      Insert.append(cell, content);

      return cell;
    });

    Insert.append(table, tbody);
    Insert.append(tbody, tr);

    Arr.each(cells, function (cell) {
      Insert.append(tr, cell);
    });

    Insert.append(Body.body(), table);

    return table;
  };

  var createTableV = function () {
    var table = Element.fromTag('table');
    var tbody = Element.fromTag('tbody');

    Attr.set(table, 'border', '1');
    Attr.set(table, 'cellpadding', random(0, 10).toString());
    Attr.set(table, 'cellspacing', random(0, 10).toString());

    Css.setAll(table, {
      'border-collapse': randomValue(['collapse', 'separate']),
      'border-top': randomBorder(0, 5, 'red'),
      'border-bottom': randomBorder(0, 5, 'red'),
      'height': randomSize(100, 1000)
    });

    var rows = Arr.range(random(1, 5), function (_) {
      var row = Element.fromTag('tr');
      var cell = Element.fromTag('td');

      Css.setAll(cell, {
        'width': '10px',
        'height': randomSize(1, 100),
        'box-sizing': randomValue(['content-box', 'border-box']),
        'padding-top': randomSize(0, 5),
        'padding-bottom': randomSize(0, 5),
        'border-top': randomBorder(0, 5, 'green'),
        'border-bottom': randomBorder(0, 5, 'green')
      });

      var content = Element.fromTag('div');

      Css.setAll(content, {
        'width': '10px',
        'height': randomSize(1, 200)
      });

      Insert.append(cell, content);
      Insert.append(row, cell);

      return row;
    });

    Insert.append(table, tbody);

    Arr.each(rows, function (row) {
      Insert.append(tbody, row);
    });

    Insert.append(Body.body(), table);

    return table;
  };

  var resizeModel = function (size, delta) {
    var deltaTotal = delta * size.cells.length;
    var cells = Arr.map(size.cells, function (cz) {
      return cz + delta;
    });

    return {
      total: size.total + deltaTotal,
      cells: cells
    };
  };

  var testTableSize = function (createTable, getOuterSize, getSize, setSize) {
    return function (n) {
      var table = createTable();
      var beforeSize = measureTable(table, getOuterSize);

      resizeTableBy(table, setSize, measureTable(table, getSize), 0);
      assertSize(beforeSize, table, getOuterSize, 'Should be unchanged in size');

      resizeTableBy(table, setSize, measureTable(table, getSize), 10);
      assertSize(resizeModel(beforeSize, 10), table, getOuterSize, 'Should be changed by 10 size');

      Remove.remove(table);
    };
  };

  var generateTest = function (generator, n) {
    Arr.each(Arr.range(n, Fun.identity), generator);
  };

  generateTest(testTableSize(createTableH, getOuterWidth, RuntimeSize.getWidth, setWidth), 50);
  generateTest(testTableSize(createTableV, getOuterHeight, RuntimeSize.getHeight, setHeight), 50);
});

