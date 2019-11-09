import { Option } from '@ephox/katamari';
import { Css, Element, Height, Location, Width } from '@ephox/sugar';

import { SugarEvent, SugarPosition } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as DragCoord from '../../api/data/DragCoord';
import * as Snappables from '../snap/Snappables';
import * as BlockerUtils from './BlockerUtils';
import { DraggingConfig, DraggingState, DragModeDeltas, DragStartData } from './DraggingTypes';
import * as DragMovement from './DragMovement';

const getCurrentCoord = (target: Element): DragCoord.CoordAdt => {
  return Css.getRaw(target, 'left').bind((left) => {
    return Css.getRaw(target, 'top').bind((top) => {
      return Css.getRaw(target, 'position').map((position) => {
        const nu = position === 'fixed' ? DragCoord.fixed : DragCoord.offset;
        return nu(
          parseInt(left, 10),
          parseInt(top, 10)
        );
      });
    });
  }).getOrThunk(() => {
    const location = Location.absolute(target);
    return DragCoord.absolute(location.left(), location.top());
  });
};

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
  getCurrentCoord,
  calcStartData,
  move,
  stop
};
