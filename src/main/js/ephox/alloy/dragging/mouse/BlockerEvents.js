define(
  'ephox.alloy.dragging.mouse.BlockerEvents',

  [
    'ephox.alloy.construct.EventHandler'
  ],

  function (EventHandler) {
    var init = function (dragApi) {
      return {
        // When the user clicks on the blocker, something has probably gone slightly
        // wrong, so we'll just drop for safety. The blocker should really only
        // be there when the mouse is already down and not released, so a 'click'
        // shouldn't happen
        mousedown: EventHandler.nu({
          run: function () {
            dragApi.forceDrop(); //(safety)
          }
        }),

        // When the user releases the mouse on the blocker, that is a drop
        mouseup: EventHandler.nu({
          run: function () { 
            dragApi.drop();
          }
        }),
        
        // As the user moves the mouse around (while pressed down), we move the 
        // component around
        mousemove: EventHandler.nu({
          run: function (comp, simulatedEvent) {
            dragApi.move(simulatedEvent.event());
          }
        }),

        // When the use moves outside the range, schedule a block to occur but
        // give it a chance to be cancelled.
        mouseout: EventHandler.nu({
          run: function () {
            dragApi.delayDrop();
          }
        })
      };
    };

    return {
      init: init
    };
  }
);
