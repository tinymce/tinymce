import { Arr, Fun, Option } from '@ephox/katamari';
import { Classes, Css, Scroll, Traverse } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as OffsetOrigin from '../../alien/OffsetOrigin';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as DragCoord from '../../api/data/DragCoord';
import * as Dockables from './Dockables';
import { DockingConfig, DockingMode, DockingState } from './DockingTypes';

const addPx = (num: number) => num + 'px';

const morphToStatic = (component: AlloyComponent, config: DockingConfig): void => {
  Arr.each([ 'left', 'top', 'bottom', 'position' ], (prop) => Css.remove(component.element(), prop));
  config.onUndocked(component);
};

const morphToAbsolute = (component: AlloyComponent, config: DockingConfig, left: number, top: number): void => {
  // Calculate the original offsets
  const elem = component.element();
  const scroll = Scroll.get(Traverse.owner(elem));
  const origin = OffsetOrigin.getOrigin(elem);

  // Calculate the new styles
  const styles = DragCoord.toStyles(DragCoord.absolute(left, top), scroll, origin);

  // Apply the new ones and fire that the element is no longer docked
  Css.setOptions(elem, styles);
  config.onUndocked(component);
};

const morphToFixed = (component: AlloyComponent, config: DockingConfig, left: number, top: number, bottom: number, mode: DockingMode): void => {
  // Calculate the new styles
  const isTop = mode === 'top';
  const styles: Record<string, Option<string>> = {
    position: Option.some('fixed'),
    left: Option.some(addPx(left)),
    right: Option.none(),
    top: isTop ? Option.some(addPx(top)) : Option.none(),
    bottom: !isTop ? Option.some(addPx(bottom)) : Option.none(),
  };

  // Apply the new styles and fire that the element is docked
  Css.setOptions(component.element(), styles);
  config.onDocked(component);
};

const updateVisibility = (component: AlloyComponent, config: DockingConfig, state: DockingState, viewport: Boxes.Bounds, morphToDocked: boolean = false) => {
  config.contextual.each((contextInfo) => {
    // Make the dockable component disappear if the context is outside the viewport
    contextInfo.lazyContext(component).each((box) => {
      const isVisible = Dockables.isPartiallyVisible(box, viewport);
      if (isVisible !== state.isVisible()) {
        state.setVisible(isVisible);

        // If morphing to docked and the context isn't visible then immediately set
        // the fadeout class and don't worry about transitioning, as the context
        // would never have been in view while docked
        if (morphToDocked && !isVisible) {
          Classes.add(component.element(), [ contextInfo.fadeOutClass ]);
          contextInfo.onHide(component);
        } else {
          const method = isVisible ? Dockables.appear : Dockables.disappear;
          method(component, contextInfo);
        }
      }
    });
  });
};

const refreshInternal = (component: AlloyComponent, config: DockingConfig, state: DockingState) => {
  // Absolute coordinates (considers scroll)
  const viewport = config.lazyViewport(component);
  // If docked then check if we need to hide/show the component
  const isDocked = state.isDocked();
  if (isDocked) {
    updateVisibility(component, config, state, viewport);
  }

  Dockables.getMorph(component, config, viewport).each((morph) => {
    // Toggle the docked state
    state.setDocked(!isDocked);
    // Apply the morph result
    morph.fold(
      () => morphToStatic(component, config),
      (left, top) => morphToAbsolute(component, config, left, top),
      (left, top, bottom, mode) => {
        updateVisibility(component, config, state, viewport, true);
        morphToFixed(component, config, left, top, bottom, mode);
      },
    );
  });
};

const resetInternal = (component: AlloyComponent, config: DockingConfig, state: DockingState) => {
  // Morph back to the original position
  const elem = component.element();
  state.setDocked(false);
  Dockables.getMorphToOriginal(component, config).each((morph) => {
    morph.fold(
      () => morphToStatic(component, config),
      (left, top) => morphToAbsolute(component, config, left, top),
      Fun.noop
    );
  });

  // Remove contextual visibility classes
  state.setVisible(true);
  config.contextual.each((contextInfo) => {
    Classes.remove(elem, [ contextInfo.fadeInClass, contextInfo.fadeOutClass, contextInfo.transitionClass ]);
    contextInfo.onShow(component);
  });

  // Apply docking again to reset the position
  refresh(component, config, state);
};

const refresh = (component: AlloyComponent, config: DockingConfig, state: DockingState) => {
  // Ensure the component is attached to the document/world, if not then do nothing as we can't
  // check if the component should be docked or not when in a detached state
  if (component.getSystem().isConnected()) {
    refreshInternal(component, config, state);
  }
};

const reset = (component: AlloyComponent, config: DockingConfig, state: DockingState) => {
  // If the component is not docked then there's no need to reset the state,
  // so only reset when docked
  if (state.isDocked()) {
    resetInternal(component, config, state);
  }
};

const isDocked = (component: AlloyComponent, config: DockingConfig, state: DockingState) => {
  return state.isDocked();
};

export { refresh, reset, isDocked };
