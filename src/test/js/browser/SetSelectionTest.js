test(
  'Browser Test: SetSelectionTest',

  [
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.selection.WindowSelection',
    'global!window'
  ],

  function (InsertAll, Body, Element, WindowSelection, window) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var p1 = Element.fromHtml('<p>This is the first paragraph</p>');
    var p2 = Element.fromHtml('<p>This is the second paragraph</p>');

    InsertAll.append(Body.body(), [ p1, p2 ]);

    WindowSelection.set(window, p1, 0, p2, 0);


  }
);
