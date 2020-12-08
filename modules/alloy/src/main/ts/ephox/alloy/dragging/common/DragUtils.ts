import { Optional } from '@ephox/katamari';
import { EventArgs, Height, SugarPosition, Width } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { EventFormat } from '../../events/SimulatedEvent';
import * as Snappables from '../snap/Snappables';
import * as BlockerUtils from './BlockerUtils';
import { DraggingConfig, DraggingState, DragModeDeltas, DragStartData } from './DraggingTypes';
import * as DragMovement from './DragMovement';

type EventsFunc<C extends DraggingConfig<E>, A extends EventFormat, E> = (dragConfig: C, dragState: DraggingState, updateStartState: (comp: AlloyComponent) => void) => Array<AlloyEvents.AlloyEventKeyAndHandler<A>>;

const calcStartData = <E>(dragConfig: DraggingConfig<E>, comp: AlloyComponent): DragStartData => ({
  bounds: dragConfig.getBounds(),
  height: Height.getOuter(comp.element),
  width: Width.getOuter(comp.element)
});

const move = <E, ET extends Event>(component: AlloyComponent, dragConfig: DraggingConfig<E>, dragState: DraggingState, dragMode: DragModeDeltas<ET, SugarPosition>, event: EventArgs<ET>): void => {
  const delta = dragState.update(dragMode, event);
  const dragStartData = dragState.getStartData().getOrThunk(() => calcStartData(dragConfig, component));
  delta.each((dlt) => {
    DragMovement.dragBy(component, dragConfig, dragStartData, dlt);
  });
};

const stop = <E>(component: AlloyComponent, blocker: Optional<AlloyComponent>, dragConfig: DraggingConfig<E>, dragState: DraggingState): void => {
  blocker.each(BlockerUtils.discard);
  dragConfig.snaps.each((snapInfo) => {
    Snappables.stopDrag(component, snapInfo);
  });
  const target = dragConfig.getTarget(component.element);
  dragState.reset();
  dragConfig.onDrop(component, target);
};

const handlers = <C extends DraggingConfig<E>, A extends EventFormat, E>(events: EventsFunc<C, A, E>) => (dragConfig: C, dragState: DraggingState): AlloyEvents.AlloyEventRecord => {
  const updateStartState = (comp: AlloyComponent) => {
    dragState.setStartData(calcStartData(dragConfig, comp));
  };

  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.windowScroll(), (comp) => {
      // Only update if we have some start data
      dragState.getStartData().each(() => updateStartState(comp));
    }),
    ...events(dragConfig, dragState, updateStartState)
  ]);
};

export {
  calcStartData,
  handlers,
  move,
  stop
};
