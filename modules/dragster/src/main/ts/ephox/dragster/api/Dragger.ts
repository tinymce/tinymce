import MouseDrag from './MouseDrag';
import Dragging from '../core/Dragging';
import { DragMode, DragMutation } from './DragApis';
import { BlockerOptions } from '../detect/Blocker';

export interface DraggerOptions extends BlockerOptions {
  mode: DragMode;
}

const transform = function (mutation: DragMutation, settings: Partial<DraggerOptions> = {}) {
  const mode: DragMode = settings.mode !== undefined ? settings.mode : MouseDrag;
  return Dragging.setup(mutation, mode, settings);
};

export default {
  transform
};