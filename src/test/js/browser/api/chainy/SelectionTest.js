asynctest(
  'SelectionTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Chain',
    'ephox.mcagar.api.chainy.Api',
    'ephox.mcagar.api.chainy.Editor'
  ],

  function (Pipeline, Chain, Api, Editor) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Pipeline.async({}, [
      Chain.asStep({}, [
        Editor.cCreate,
        Api.cFocus,
        Api.cSetContent('<p>this is one paragraph</p><p>This is another</p>'),
        Api.cSetSelection([ 0, 0 ], 'this'.length, [ 1, 0 ], 'This is'.length),
        Api.cAssertSelection([ 0, 0 ], 'this'.length, [ 1, 0 ], 'This is'.length),

        Api.cSetCursor([ 0, 0 ], 't'.length),
        Api.cAssertSelection([ 0, 0 ], 't'.length, [ 0, 0 ], 't'.length),

        Api.cSetSelectionFrom({
          start: {
            element: [ 0, 0 ], offset: 'this '.length
          },
          finish: {
            element: [ 1 ], offset: 0
          }
        }),
        Api.cAssertSelection([ 0, 0 ], 'this '.length, [ 1 ], 0),
        Api.cSetSelectionFrom({
          element: [ 0 ],
          offset: 1
        }),
        Api.cAssertSelection([ 0 ], 1, [ 0 ], 1),

        Api.cSetContent('<p>one <strong>word</strong> here</p>'),
        Api.cSelect('p', [ 1 ]),
        // This may not be normalised across all browsers
        Api.cAssertSelection([ 0 ], 1, [ 0 ], 2),
        Editor.cRemove
      ])
    ], function () {
      success();
    }, failure);
  }
);