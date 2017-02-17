define(
  'ephox.alloy.positioning.layout.Bubble',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.view.Position'
  ],

  function (Fun, Position) {
    /*
       Width needs to be the exact distance from the edge of the dialog to the point of the bubble.

       Previously this used to guesstimate but that lead to custom bubbles because it doesn't actually work.
     */
    return function (width, yoffset) {
      return {
        southeast: Fun.constant(Position(-width, yoffset)),
        southwest: Fun.constant(Position(width , yoffset)),
        northeast: Fun.constant(Position(-width, -yoffset)),
        northwest: Fun.constant(Position(width, -yoffset))
      };
    };
  }
);