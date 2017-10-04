define(
  'tinymce.plugins.table.actions.TableWire',

  [
    'ephox.snooker.api.ResizeWire',
    'ephox.sugar.api.node.Element'
  ],

  function (ResizeWire, Element) {
    var get = function (editor) {
      return editor.inline ? ResizeWire.detached(Element.fromDom(editor.getBody()), Element.fromDom(editor.getBody())) : ResizeWire.only(Element.fromDom(editor.getDoc()));
    };

    return {
      get: get
    };
  }
);
