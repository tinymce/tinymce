test(
  'CloneFormatsTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.TableFill',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html'
  ],

  function (Fun, Option, TableFill, Insert, Element, Html) {
    var doc = document;
    var cloneFormats = Option.some(['strong', 'em', 'b', 'i', 'span', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div']);
    var noCloneFormats = Option.none();
    var cloneTableFill = TableFill.cellOperations(Fun.noop, doc, cloneFormats);
    var noCloneTableFill = TableFill.cellOperations(Fun.noop, doc, noCloneFormats);

    var cellElement = Element.fromTag('td');
    var cellContent = Element.fromHtml('<strong><em>stuff</em></strong>');
    Insert.append(cellElement, cellContent);
    var cell = {
      element: Fun.constant(cellElement),
      colspan: Fun.constant(1)
    };

    var clonedCell = cloneTableFill.cell(cell);

    assert.eq('<td><strong><em><br></em></strong></td>', Html.getOuter(clonedCell));

    var noClonedCell = noCloneTableFill.cell(cell);
    assert.eq('<td><br></td>', Html.getOuter(noClonedCell));
  }
);