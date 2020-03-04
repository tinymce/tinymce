import { Css, Scroll, Traverse } from '@ephox/sugar';

import * as OffsetOrigin from '../../alien/OffsetOrigin';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as DragCoord from '../../api/data/DragCoord';
import { DraggingConfig, DraggingState, SnapConfig } from '../../dragging/common/DraggingTypes';
import * as Snappables from '../../dragging/snap/Snappables';

const snapTo = <E>(component: AlloyComponent, dragConfig: DraggingConfig<E>, _state: DraggingState, snap: SnapConfig<E>): void => {
  const target = dragConfig.getTarget(component.element());
  if (dragConfig.repositionTarget) {
    const doc = Traverse.owner(component.element());
    const scroll = Scroll.get(doc);

    const origin = OffsetOrigin.getOrigin(target);

    const snapPin = Snappables.snapTo(snap, scroll, origin);

    const styles = DragCoord.toStyles(snapPin.coord, scroll, origin);
    Css.setOptions(target, styles);
  }
};

export {
  snapTo
};
