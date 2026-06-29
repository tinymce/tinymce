import { Behaviour, type AlloyComponent, type BehaviourState } from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Cell, Num, Optional } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

export interface ResizeBounds {
  readonly minWidth?: number;
  readonly maxWidth?: number;
  readonly minHeight?: number;
  readonly maxHeight?: number;
}

interface ResizeConstraints {
  readonly minWidth: Optional<number>;
  readonly maxWidth: Optional<number>;
  readonly minHeight: Optional<number>;
  readonly maxHeight: Optional<number>;
}

interface ResizingConfigSpec extends Behaviour.BehaviourConfigSpec {
  readonly resize: (component: AlloyComponent, width: number, height: number) => void;
}

interface ResizeSize {
  readonly width: number;
  readonly height: number;
}

interface ResizingState extends BehaviourState {
  readonly start: (width: number, height: number, bounds: ResizeBounds) => void;
  readonly drag: (delta: SugarPosition) => SugarPosition;
  readonly getOriginalSize: () => ResizeSize;
  readonly getBounds: () => ResizeConstraints;
}

const ResizingState = {
  init: (): ResizingState => {
    const originalWidth = Cell(0);
    const originalHeight = Cell(0);
    const accumulatedDelta = Cell<SugarPosition>(SugarPosition(0, 0));
    const bounds = Cell<ResizeConstraints>({
      minWidth: Optional.none(),
      maxWidth: Optional.none(),
      minHeight: Optional.none(),
      maxHeight: Optional.none()
    });

    const start = (width: number, height: number, newBounds: ResizeBounds): void => {
      originalWidth.set(width);
      originalHeight.set(height);
      accumulatedDelta.set(SugarPosition(0, 0));
      bounds.set({
        minWidth: Optional.from(newBounds.minWidth),
        maxWidth: Optional.from(newBounds.maxWidth),
        minHeight: Optional.from(newBounds.minHeight),
        maxHeight: Optional.from(newBounds.maxHeight)
      });
    };

    const drag = (delta: SugarPosition): SugarPosition => {
      const acc = accumulatedDelta.get().translate(delta.left, delta.top);
      accumulatedDelta.set(acc);
      return acc;
    };

    const getOriginalSize = (): ResizeSize => ({ width: originalWidth.get(), height: originalHeight.get() });

    const getBounds = (): ResizeConstraints => bounds.get();

    const readState = (): Record<string, unknown> => ({
      originalWidth: originalWidth.get(),
      originalHeight: originalHeight.get(),
      accumulatedDelta: accumulatedDelta.get(),
      bounds: bounds.get()
    });

    return {
      start,
      drag,
      getOriginalSize,
      getBounds,
      readState
    };
  }
};

const start = (_component: AlloyComponent, _config: ResizingConfigSpec, state: ResizingState, width: number, height: number, bounds: ResizeBounds): void => {
  state.start(width, height, bounds);
};

const drag = (component: AlloyComponent, config: ResizingConfigSpec, state: ResizingState, delta: SugarPosition): void => {
  const accumulatedDelta = state.drag(delta);
  const originalSize = state.getOriginalSize();
  const bounds = state.getBounds();

  const width = Num.clamp(originalSize.width + accumulatedDelta.left, bounds.minWidth.getOr(0), bounds.maxWidth.getOr(Number.MAX_VALUE));
  const height = Num.clamp(originalSize.height + accumulatedDelta.top, bounds.minHeight.getOr(0), bounds.maxHeight.getOr(Number.MAX_VALUE));

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
