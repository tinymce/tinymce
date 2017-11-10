define(
  'ephox.mcagar.api.ActionChains',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.FocusTools',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element'
  ],

  function (Chain, NamedChain, Keyboard, FocusTools, Fun, Element) {
    var cIDoc = Chain.mapper(function (editor) {
      return Element.fromDom(editor.getDoc());
    });

    var cUiDoc = Chain.mapper(function (editor) {
      return Element.fromDom(document);
    });

    var cTriggerKeyEvent = function (cTarget, evtType, code, modifiers) {
      return NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), cTarget, 'doc'),
        NamedChain.direct('doc', FocusTools.cGetFocused, 'activeElement'),
        NamedChain.direct('activeElement', Chain.op(function (dispatcher) {
          Keyboard[evtType](code, modifiers !== undefined ? modifiers : {}, dispatcher);
        }), '_'),
        NamedChain.output(NamedChain.inputName())
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