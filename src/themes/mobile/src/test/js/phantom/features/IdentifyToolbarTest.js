test(
  'features.IdentifyToolbarTest',

  [
    'ephox.agar.api.Assertions',
    'tinymce.themes.mobile.features.Features'
  ],

  function (Assertions, Features) {
    var check = function (label, expected, input) {
      var actual = Features.identify(input);
      Assertions.assertEq(label, expected, actual);
    };

    check('Default toolbar', [ 'undo', 'bold', 'italic', 'link', 'image', 'bullist' ], { });
    check('Empty toolbar', [ ], { toolbar: '' });
    check('Empty toolbar (array)', [ ], { toolbar: [ ] });

    check('Flat toolbar', [ 'undo', 'bold' ], { toolbar: 'undo bold' });
    check('Flat toolbar (array)', [ 'undo', 'bold' ], { toolbar: [ 'undo', 'bold' ] });

    check('Nested toolbar (array)', [ 'undo', 'bold', 'italic' ], { toolbar: [ [ 'undo' ], [ 'bold', 'italic' ] ] });

    check('Mixed toolbar (array)', [ 'undo', 'bold', 'redo', 'italic' ], { toolbar: [ [ 'undo' ], [ ], [ 'bold redo', 'italic' ] ] });
  }
);
