define(
  'ephox.darwin.api.Beta',

  [

  ],

  function () {
    var updateSelection = function (container, selected, rows, columns) {
      var update = function (newSels) {
        CellSelection.clear(ephoxUi);
        CellSelection.selectRange(ephoxUi, newSels.boxes(), newSels.start(), newSels.finish());
      };
    }


      // ignoring bias for the time being.
      if (event.raw().shiftKey && event.raw().which >= 37 && event.raw().which <= 40) {
        if (event.raw().which === 39) CellSelection.shiftRight(selected).each(update);
        else if (event.raw().which === 37) CellSelection.shiftLeft(selected).each(update);
        else if (event.raw().which === 38) CellSelection.shiftUp(selected).each(update);
        else if (event.raw().which === 40) CellSelection.shiftDown(selected).each(update);
        console.log('this is where you would handle expanding the table selection');
        event.kill();
      } else if (event.raw().shiftKey === false) {
        CellSelection.clear(ephoxUi);
      }
  }
);