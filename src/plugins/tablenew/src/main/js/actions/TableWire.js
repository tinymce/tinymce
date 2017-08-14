define(
  'tinymce.plugins.tablenew.actions.TableWire',

  [
    'ephox.snooker.api.ResizeWire',
    'ephox.sugar.api.node.Element'
  ],

  function (ResizeWire, Element) {
    var get = function (editor, doc) {
      return editor.inline ? ResizeWire.detached(Element.fromDom(editor.getBody()), Element.fromDom(editor.container())) : ResizeWire.only(Element.fromDom(editor.getDoc()));
    };

    return {
      get: get
    };
  }
);
