define(
  'ephox.mcagar.api.TinyActions',

  [
    'ephox.agar.api.Keyboard',
    'ephox.sugar.api.node.Element'
  ],

  function (Keyboard, Element) {
    return function (editor) {
      var iDoc = Element.fromDom(editor.getDoc());
      var uiDoc = Element.fromDom(document);

      var sContentKeydown = function (code, modifiers) {
        return Keyboard.sKeydown(iDoc, code, modifiers !== undefined ? modifiers : {});
      };

      var sContentKeystroke = function (code, modifiers) {
        return Keyboard.sKeystroke(iDoc, code, modifiers);
      };

      var sContentKeypress = function (code, modifiers) {
        return Keyboard.sKeypress(iDoc, code, modifiers);
      };

      var sUiKeydown = function (code, modifiers) {
        return Keyboard.sKeydown(uiDoc, code, modifiers !== undefined ? modifiers : {});
      };

      return {
        sContentKeypress: sContentKeypress,
        sContentKeydown: sContentKeydown,
        sContentKeystroke: sContentKeystroke,

        sUiKeydown: sUiKeydown
      };
    };
  }
);