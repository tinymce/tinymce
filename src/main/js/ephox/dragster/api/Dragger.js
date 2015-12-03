define(
  'ephox.dragster.api.Dragger',

  [
    'ephox.dragster.api.MouseDrag',
    'ephox.dragster.core.Dragging',
    'global!Array'
  ],

  function (MouseDrag, Dragging, Array) {
    var transform = function (mutation, options) {
      var settings = options !== undefined ? options : {};
      var mode = settings.mode !== undefined ? settings.mode : MouseDrag;
      return Dragging.setup(mutation, mode, options);
    };
      
    return {
      transform: transform
    };
  }
);
