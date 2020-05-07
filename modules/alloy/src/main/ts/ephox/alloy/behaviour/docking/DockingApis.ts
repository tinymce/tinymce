import { Arr, Fun } from '@ephox/katamari';
import { Classes, Css } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { applyPositionCss, PositionCss } from '../../positioning/view/PositionCss';
import * as Dockables from './Dockables';
import { DockingConfig, DockingMode, DockingState } from './DockingTypes';

const morphToStatic = (component: AlloyComponent, config: DockingConfig): void => {
  Arr.each([ 'left', 'right', 'top', 'bottom', 'position' ], (prop) => Css.remove(component.element(), prop));
  config.onUndocked(component);
};

const morphToCoord = (component: AlloyComponent, config: DockingConfig, position: PositionCss): void => {
  applyPositionCss(component.element(), position);
  const method = position.position() === 'fixed' ? config.onDocked : config.onUndocked;
  method(component);
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

  Dockables.getMorph(component, viewport, state).each((morph) => {
    // Toggle the docked state
    state.setDocked(!isDocked);
    // Apply the morph result
    morph.fold(
      () => morphToStatic(component, config),
      (position) => morphToCoord(component, config, position),
      (position) => {
        updateVisibility(component, config, state, viewport, true);
        morphToCoord(component, config, position);
      },
    );
  });
};

const resetInternal = (component: AlloyComponent, config: DockingConfig, state: DockingState) => {
  // Morph back to the original position
  const elem = component.element();
  state.setDocked(false);
  Dockables.getMorphToOriginal(component, state).each((morph) => {
    morph.fold(
      () => morphToStatic(component, config),
      (position) => morphToCoord(component, config, position),
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

const isDocked = (component: AlloyComponent, config: DockingConfig, state: DockingState) => state.isDocked();

const setModes = (component: AlloyComponent, config: DockingConfig, state: DockingState, modes: DockingMode[]) => state.setModes(modes);

const getModes = (component: AlloyComponent, config: DockingConfig, state: DockingState) => state.getModes();

export { refresh, reset, isDocked, getModes, setModes };
