import { Bindable } from '@ephox/porkbun';
import { EventArgs, SugarPosition } from '@ephox/sugar';
import { DragMode } from '../api/DragApis';

export interface DragEvent {
  readonly info: SugarPosition;
}

export interface DragEvents {
  readonly registry: {
    move: Bindable<DragEvent>;
  };
  readonly trigger: {
    move: (info: SugarPosition) => void;
  };
}

export interface DragState {
  readonly onEvent: (event: EventArgs, mode: DragMode) => void;
  readonly reset: () => void;
  readonly events: DragEvents['registry'];
}
