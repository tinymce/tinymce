import { AlloyComponent } from '../../api/component/ComponentApi';
import { DraggingConfigSpec, SnapConfig, DraggingState } from '../../dragging/common/DraggingTypes';
import { Traverse, Scroll, Css } from '@ephox/sugar';
import * as OffsetOrigin from '../../alien/OffsetOrigin';
import * as Snappables from '../../dragging/snap/Snappables';
import * as DragCoord from '../../api/data/DragCoord';
import { SugarPosition } from '../../alien/TypeDefinitions';

const snapTo = function (component: AlloyComponent, dragConfig: DraggingConfigSpec, _state: DraggingState<SugarPosition>, snap: SnapConfig): void {
  const target = dragConfig.getTarget(component.element());
  if (dragConfig.repositionTarget) {
    const doc = Traverse.owner(component.element());
    const scroll = Scroll.get(doc);

    const origin = OffsetOrigin.getOrigin(target);

    const snapPin = Snappables.snapTo(snap, scroll, origin);

    const styles = DragCoord.toStyles(snapPin.coord, scroll, origin);
    Css.setAll(target, styles);
  }
};

export {
  snapTo
};
