import * as Dragging from '../core/Dragging';
import { BlockerOptions } from '../detect/Blocker';
import { DragMode, DragMutation } from './DragApis';
import MouseDrag from './MouseDrag';

export interface DraggerOptions extends BlockerOptions {
  readonly mode: DragMode<MouseEvent>;
}

const transform = (mutation: DragMutation, settings: Partial<DraggerOptions> = {}): Dragging.Dragging => {
  const mode = settings.mode ?? MouseDrag;
  return Dragging.setup(mutation, mode, settings);
};

export {
  transform
};
