import InDrag from './InDrag';
import NoDrag from './NoDrag';
import { DragMode } from '../api/DragApis';
import { EventArgs } from '@ephox/sugar';

interface DragState {
  onEvent: (event: EventArgs, mode: DragMode) => void;
  reset: () => void;
}

export default function () {
  const noDragState = NoDrag();
  const inDragState = InDrag();
  let dragState: DragState = noDragState;

  const on = function () {
    dragState.reset();
    dragState = inDragState;
  };

  const off = function () {
    dragState.reset();
    dragState = noDragState;
  };

  const onEvent = function (event: EventArgs, mode: DragMode) {
    dragState.onEvent(event, mode);
  };

  const isOn = function () {
    return dragState === inDragState;
  };

  return {
    on,
    off,
    isOn,
    onEvent,
    events: inDragState.events
  };
}