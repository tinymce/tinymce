define(
  'ephox.snooker.model.Impera',

  [

  ],

  function () {



    // What this thing has to do.
    // Given a structure, which is an array of arrays representing a table:
    // 1. Loop though the cells of the structure.
    // 2. Find the lead element
    // 3. Generate the substitute element
    // 4. Substitute the lead element with the substitute element
    // 5. Remove the other cells within the range.
    var render = function (structure, cells, lead, comparator) {


    };

    return {
      render: render
    };
  }
);