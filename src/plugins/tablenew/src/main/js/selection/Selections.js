define(
  'tinymce.plugins.tablenew.selection.Selections',

  [
    'ephox.darwin.api.TableSelection',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.tablenew.selection.Ephemera',
    'tinymce.plugins.tablenew.selection.SelectionTypes'
  ],

  function (TableSelection, Element, Ephemera, SelectionTypes) {
    return function (editor) {
      var get = function () {
        var body = Element.fromDom(editor.getBody());

        return TableSelection.retrieve(body, Ephemera.selectedSelector()).fold(function () {
          if (editor.selection.getStart() === undefined) {
            return SelectionTypes.none();
          } else {
            return SelectionTypes.single(editor.selection);
          }
        }, function (cells) {
          return SelectionTypes.multiple(cells);
        });
      };

      return {
        get: get
      };
    };
  }
);
