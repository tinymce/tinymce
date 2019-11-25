import { Option } from '@ephox/katamari';
import { Height, Width } from '@ephox/sugar';

import { SugarEvent, SugarPosition } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Snappables from '../snap/Snappables';
import * as BlockerUtils from './BlockerUtils';
import { DraggingConfig, DraggingState, DragModeDeltas, DragStartData } from './DraggingTypes';
import * as DragMovement from './DragMovement';

const calcStartData = (dragConfig: DraggingConfig, comp: AlloyComponent): DragStartData => {
  return {
    bounds: dragConfig.getBounds(),
    height: Height.getOuter(comp.element()),
    width: Width.getOuter(comp.element())
  };
};

const move = (component: AlloyComponent, dragConfig: DraggingConfig, dragState: DraggingState<SugarPosition>, dragMode: DragModeDeltas<SugarPosition>, event: SugarEvent) => {
  const delta = dragState.update(dragMode, event);
  const dragStartData = dragState.getStartData().getOrThunk(() => calcStartData(dragConfig, component));
  delta.each((dlt) => {
    DragMovement.dragBy(component, dragConfig, dragStartData, dlt);
  });
};

const stop = (component: AlloyComponent, blocker: Option<AlloyComponent>, dragConfig: DraggingConfig, dragState: DraggingState<SugarPosition>) => {
  blocker.each(BlockerUtils.discard);
  dragConfig.snaps.each((snapInfo) => {
    Snappables.stopDrag(component, snapInfo);
  });
  const target = dragConfig.getTarget(component.element());
  dragState.reset();
  dragConfig.onDrop(component, target);
};

export {
  calcStartData,
  move,
  stop
};
