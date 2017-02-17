define(
  'ephox.alloy.test.NavigationUtils',

  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.search.Traverse',
    'global!Array'
  ],

  function (FocusTools, GeneralSteps, Keyboard, Step, UiFinder, Waiter, Arr, Traverse, Array) {
    var range = function (num, f) {
      var array = new Array(num);
      return Arr.bind(array, f);
    };

    var sequence = function (doc, key, modifiers, identifiers) {
      var array = range(identifiers.length, function (_, i) {
        return [
          Keyboard.sKeydown(doc, key, modifiers),
          FocusTools.sTryOnSelector(
            'Focus should move from ' + (i > 0 ? identifiers[i-1].label : '(start)') + ' to ' + identifiers[i].label,
            doc,
            identifiers[i].selector
          ),
          Step.wait(0)
        ];
      });
      
      return GeneralSteps.sequence(array);
    };

    // Selector based 
    var highlights = function (container, key, modifiers, identifiers) {
      var array = range(identifiers.length, function (_, i) {
        var msg = 'Highlight should move from ' + (i > 0 ? identifiers[i-1].label : '(start)') + ' to ' + identifiers[i].label;
        var doc = Traverse.owner(container);
        return [
          Keyboard.sKeydown(doc, key, modifiers),
          Waiter.sTryUntil(
            msg,
            UiFinder.sExists(container, identifiers[i].selector),
            100,
            1000
          ),
          Step.wait(0)
        ];
      });
      
      return GeneralSteps.sequence(array);
    };

    return {
      sequence: sequence,
      highlights: highlights
    };
  }
);