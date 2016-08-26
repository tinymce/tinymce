define(
  'ephox.alloy.test.NavigationUtils',

  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.compass.Arr',
    'global!Array'
  ],

  function (FocusTools, GeneralSteps, Keyboard, Arr, Array) {
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
          ) 
        ];
      });
      
      return GeneralSteps.sequence(array);
    };

    return {
      sequence: sequence
    };
  }
);