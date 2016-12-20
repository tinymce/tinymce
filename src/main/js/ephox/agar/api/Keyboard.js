define(
  'ephox.agar.api.Keyboard',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.keyboard.FakeKeys',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.search.Traverse',
    'global!Error'
  ],

  function (Chain, FocusTools, FakeKeys, Arr, Fun, Traverse, Error) {
    /*
      doc - document scope
      value - which keycode
      modifiers - { shift: BOOL, alt: BOOL }
      dispatcher - dispatch event from some element
    */
    var fakeKeys = function (types, value, modifiers, dispatcher) {
      var doc = Traverse.owner(dispatcher);
      Arr.each(types, function (type) {
        FakeKeys.keyevent(type, doc, value, modifiers, dispatcher);
      });
    };

    var cFakeKey = function (types, keyvalue, modifiers) {
      return Chain.op(function (dispatcher) {
        fakeKeys(types, keyvalue, modifiers, dispatcher);
      });
    };

    var sFakeKey = function (types) {
      return function (doc, keyvalue, modifiers) {
        return Chain.asStep(doc, [
          FocusTools.cGetFocused,
          cFakeKey(types, keyvalue, modifiers)
        ]);
      };
    };

    var keydownTypes = [ 'keydown' ];
    var keyupTypes = [ 'keyup' ];
    var keypressTypes = [ 'keypress' ];
    // Should throw an error
    var keystrokeTypes = [ 'keydown', 'keyup' ];

    return {
      keydown: Fun.curry(fakeKeys, keydownTypes),
      keyup: Fun.curry(fakeKeys, keyupTypes),
      keypress: Fun.curry(fakeKeys, keypressTypes),
      keystroke: Fun.curry(fakeKeys, keystrokeTypes),

      sKeydown: sFakeKey(keydownTypes),
      sKeyup: sFakeKey(keyupTypes),
      sKeypress: sFakeKey(keypressTypes),      
      sKeystroke: sFakeKey(keystrokeTypes)
    };
  }
);