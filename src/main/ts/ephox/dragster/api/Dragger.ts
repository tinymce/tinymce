import MouseDrag from './MouseDrag';
import Dragging from '../core/Dragging';

var transform = function (mutation, options) {
  var settings = options !== undefined ? options : {};
  var mode = settings.mode !== undefined ? settings.mode : MouseDrag;
  return Dragging.setup(mutation, mode, options);
};

export default <any> {
  transform: transform
};