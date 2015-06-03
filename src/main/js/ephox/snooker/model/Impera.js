define(
  'ephox.snooker.model.Impera',

  [

  ],

  function () {
    var render = function (structure, range, lead, comparator) {
      if (structure.length === 0) return structure;
      for (var i=range.startRow(); i<=range.finishRow(); i++) {
        for (var j = range.startCol(); j<=range.finishCol(); j++) {
          console.log('i', i, 'j', j, 'lead', lead);
          structure[i][j] = lead;
          console.log('post:', structure[i][j], 'this', structure[i], structure);
        }
      }
      console.log('structure: ' + JSON.stringify(structure));
      return structure;
    };

    return {
      render: render
    };
  }
);