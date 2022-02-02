import { EventArgs } from '@ephox/sugar';

import { DragMode } from '../api/DragApis';
import { DragEvents, DragState } from './DragTypes';
import { InDrag } from './InDrag';
import { NoDrag } from './NoDrag';

export interface Movement {
  readonly on: () => void;
  readonly off: () => void;
  readonly isOn: () => boolean;
  readonly onEvent: (event: EventArgs, mode: DragMode) => void;
  readonly events: DragEvents['registry'];
}

export const Movement = (): Movement => {
  const noDragState = NoDrag();
  const inDragState = InDrag();
  let dragState: DragState = noDragState;

  const on = () => {
    dragState.reset();
    dragState = inDragState;
  };

  const off = () => {
    dragState.reset();
    dragState = noDragState;
  };

  const onEvent = (event: EventArgs, mode: DragMode) => {
    dragState.onEvent(event, mode);
  };

  const isOn = () => {
    return dragState === inDragState;
  };

  return {
    on,
    off,
    isOn,
    onEvent,
    events: inDragState.events
  };
};
