import { Css, Scroll, Traverse } from '@ephox/sugar';
import * as Boxes from '../../alien/Boxes';
import * as OffsetOrigin from '../../alien/OffsetOrigin';
import * as DragCoord from '../../api/data/DragCoord';
import * as Dockables from './Dockables';
import { DockingConfig } from './DockingTypes';

const refresh = (component, config: DockingConfig, state) => {
  // Absolute coordinates (considers scroll)
  const viewport = config.lazyViewport(component);

  config.contextual.each((contextInfo) => {
    // Make the dockable component disappear if the context is outside the viewport
    contextInfo.lazyContext(component).each((elem) => {
      const box: Boxes.Bounds = Boxes.box(elem);
      const isVisible = Dockables.isPartiallyVisible(box, viewport);
      const method = isVisible ? Dockables.appear : Dockables.disappear;
      method(component, contextInfo);
    });
  });

  const doc = Traverse.owner(component.element());
  const scroll = Scroll.get(doc);
  const origin = OffsetOrigin.getOrigin(component.element(), scroll);

  Dockables.getMorph(component, config, viewport, scroll, origin).each((morph) => {
    const styles = DragCoord.toStyles(morph, scroll, origin);
    Css.setAll(component.element(), styles);
  });
};

export { refresh };
