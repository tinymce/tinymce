import { Width, Height, Element, Css, Location } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { DraggingConfig, DragStartData } from './DraggingTypes';
import * as DragCoord from '../../api/data/DragCoord';

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
    width: Width.getOuter(comp.element()),
    comp
  };
};

export {
  getCurrentCoord,
  calcStartData
};
