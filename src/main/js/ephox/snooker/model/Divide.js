define(
  'ephox.snooker.model.Divide',

  [

  ],

  function () {
    var generate = function (structure, target, comparator, substitution) {
      var first = true;
      for (var i=0; i<structure.length; i++) {
        for (var j=0; j<structure[0].length; j++) {
          var current = structure[i][j];
          var isToReplace = comparator(current, target);
          if (isToReplace && !first)
            structure[i][j] = substitution;

          if (isToReplace && first) {
            structure[i][j] = target;
            first = false;
          }

        }
      }
      return structure;
    };

    return {
      generate: generate
    };
  }
);