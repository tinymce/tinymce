define(
  'ephox.mcagar.api.Actions',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.FocusTools',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element'
  ],

  function (Chain, Keyboard, FocusTools, Fun, Element) {
    var cIDoc = Chain.mapper(function (editor) {
      return Element.fromDom(editor.getDoc());
    });

    var cUiDoc = Chain.mapper(function (editor) {
      return Element.fromDom(document);
    });

    var cTriggerKeyEvent = function (cTarget, evtType, code, modifiers) {
      return Chain.fromParent(Chain.identity, [
        Chain.fromChains([
          cTarget,
          FocusTools.cGetFocused,
          Chain.op(function (dispatcher) {
            Keyboard[evtType](code, modifiers !== undefined ? modifiers : {}, dispatcher);
          })
        ])
      ]);
    };

    return {
      cContentKeypress: Fun.curry(cTriggerKeyEvent, cIDoc, 'keypress'),
      cContentKeydown: Fun.curry(cTriggerKeyEvent, cIDoc, 'keydown'),
      cContentKeystroke: Fun.curry(cTriggerKeyEvent, cIDoc, 'keystroke'),

      cUiKeydown: Fun.curry(cTriggerKeyEvent, cUiDoc, 'keydown')
    };
  }
);