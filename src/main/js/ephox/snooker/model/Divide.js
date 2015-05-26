define(
  'ephox.snooker.model.Divide',

  [

  ],

  function () {
    /*

      [
        [ 1, 1, 3 ]
      ]
      el: 1,
      comp: Fun.tripleEquals

      [
        [ 1, nu, 3 ]
      ]
     */

    var generate = function (structure, element, comparator, substitution) {
      for (var i=0; i<structure.length; i++) {
        for (var j=0; j<structure[0].length; j++) {
          var current = structure[i][j];
          var isToReplace = comparator(current, element);
          if (isToReplace)
            structure[i][j] = substitution;
        }
      }
    };

    return {
      generate: generate
    };
  }
);