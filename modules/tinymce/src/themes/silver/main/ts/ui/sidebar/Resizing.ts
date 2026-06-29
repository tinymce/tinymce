import { Behaviour, type AlloyComponent, type BehaviourState } from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Cell, Num } from '@ephox/katamari';
import type { SugarPosition } from '@ephox/sugar';

// A target-agnostic resize behaviour. It owns no DOM: it accumulates a drag delta against a
// starting size, clamps the result to the bounds supplied at `start`, and hands the new
// (width, height) to the `resize` callback. Locating and mutating the actual element is the
// caller's job.
//
// The bounds passed to `start` decide which axes resize: provide width bounds and width
// resizes; omit them and width passes through unchanged (likewise for height). Bounds are
// supplied per-drag at `start` rather than in `config` so the caller can compute them against
// live layout (e.g. a max width that depends on available space) with the component in hand.
//
// Cooperates with `Dragging` as a sibling behaviour: `delta.left` drives width, `delta.top`
// drives height. Since deltas are added, a handle whose drag direction is opposite to growth
// should invert the relevant component before passing the SugarPosition in.

export interface ResizeBounds {
  readonly minWidth?: number;
  readonly maxWidth?: number;
  readonly minHeight?: number;
  readonly maxHeight?: number;
}

interface ResizingConfigSpec extends Behaviour.BehaviourConfigSpec {
  readonly resize: (component: AlloyComponent, width: number, height: number) => void;
}

interface ResizeData {
  readonly originalWidth: number;
  readonly originalHeight: number;
  readonly accLeft: number;
  readonly accTop: number;
  readonly bounds: ResizeBounds;
}

interface ResizingState extends BehaviourState {
  readonly get: () => ResizeData;
  readonly set: (data: ResizeData) => void;
}

// Hand-rolled equivalent of alloy's internal SetupBehaviourCellState (not part of the public
// API), backed by a katamari Cell so the state lives on the component instance.
const ResizingState = {
  init: (): ResizingState => {
    const cell = Cell<ResizeData>({ originalWidth: 0, originalHeight: 0, accLeft: 0, accTop: 0, bounds: {}});
    return {
      get: cell.get,
      set: cell.set,
      readState: cell.get
    };
  }
};

// An axis resizes if it has at least one bound; a missing side is treated as unbounded.
const clampAxis = (original: number, accumulated: number, min: number | undefined, max: number | undefined): number =>
  (min === undefined && max === undefined)
    ? original
    : Num.clamp(original + accumulated, min ?? Number.NEGATIVE_INFINITY, max ?? Number.POSITIVE_INFINITY);

const start = (_component: AlloyComponent, _config: ResizingConfigSpec, state: ResizingState, width: number, height: number, bounds: ResizeBounds): void => {
  state.set({ originalWidth: width, originalHeight: height, accLeft: 0, accTop: 0, bounds });
};

const drag = (component: AlloyComponent, config: ResizingConfigSpec, state: ResizingState, delta: SugarPosition): void => {
  const data = state.get();
  const accLeft = data.accLeft + delta.left;
  const accTop = data.accTop + delta.top;
  state.set({ ...data, accLeft, accTop });

  const width = clampAxis(data.originalWidth, accLeft, data.bounds.minWidth, data.bounds.maxWidth);
  const height = clampAxis(data.originalHeight, accTop, data.bounds.minHeight, data.bounds.maxHeight);

  config.resize(component, width, height);
};

export interface ResizingBehaviour extends Behaviour.AlloyBehaviour<ResizingConfigSpec, ResizingConfigSpec> {
  readonly start: (component: AlloyComponent, width: number, height: number, bounds: ResizeBounds) => void;
  readonly drag: (component: AlloyComponent, delta: SugarPosition) => void;
}

const Resizing: ResizingBehaviour = Behaviour.create({
  fields: [
    FieldSchema.requiredFunction('resize')
  ],
  name: 'resizing',
  apis: {
    start,
    drag
  },
  state: ResizingState
});

export { Resizing };
