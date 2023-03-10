import { Arr } from '@ephox/katamari';
import { Classes, Css } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { applyPositionCss, PositionCss } from '../../positioning/view/PositionCss';
import * as Dockables from './Dockables';
import { DockingConfig, DockingDecision, DockingMode, DockingState, DockingViewport } from './DockingTypes';

const morphToStatic = (component: AlloyComponent, config: DockingConfig, state: DockingState): void => {
  state.setDocked(false);
  Arr.each([ 'left', 'right', 'top', 'bottom', 'position' ], (prop) => Css.remove(component.element, prop));
  config.onUndocked(component);
};

const morphToCoord = (component: AlloyComponent, config: DockingConfig, state: DockingState, position: PositionCss): void => {
  const isDocked = position.position === 'fixed';
  state.setDocked(isDocked);
  applyPositionCss(component.element, position);
  const method = isDocked ? config.onDocked : config.onUndocked;
  method(component);
};

const updateVisibility = (component: AlloyComponent, config: DockingConfig, state: DockingState, viewport: DockingViewport, morphToDocked: boolean = false): void => {
  config.contextual.each((contextInfo) => {
    // Make the dockable component disappear if the context is outside the viewport
    contextInfo.lazyContext(component).each((box) => {
      const isVisible = Dockables.isPartiallyVisible(box, viewport.bounds);
      if (isVisible !== state.isVisible()) {
        state.setVisible(isVisible);

        // If morphing to docked and the context isn't visible then immediately set
        // the fadeout class and don't worry about transitioning, as the context
        // would never have been in view while docked
        if (morphToDocked && !isVisible) {
          Classes.add(component.element, [ contextInfo.fadeOutClass ]);
          contextInfo.onHide(component);
        } else {
          const method = isVisible ? Dockables.appear : Dockables.disappear;
          method(component, contextInfo);
        }
      }
    });
  });
};

const applyFixedMorph = (
  component: AlloyComponent,
  config: DockingConfig,
  state: DockingState,
  viewport: DockingViewport,
  morph: Dockables.FixedMorph
) => {
  // This "updateVisibility" call is potentially duplicated with the
  // call in refreshInternal for isDocked. We might want to consolidate them.
  // The difference between them is the "morphToDocked" flag.
  updateVisibility(component, config, state, viewport, true);
  morphToCoord(component, config, state, morph.positionCss);
};

const applyMorph = (
  component: AlloyComponent,
  config: DockingConfig,
  state: DockingState,
  viewport: DockingViewport,
  morph: Dockables.MorphInfo
) => {
  // Apply the morph result depending on its type
  switch (morph.morph) {
    case 'static': {
      return morphToStatic(component, config, state);
    }
    case 'absolute': {
      return morphToCoord(component, config, state, morph.positionCss);
    }
    case 'fixed': {
      return applyFixedMorph(component, config, state, viewport, morph);
    }
  }
};

const refreshInternal = (component: AlloyComponent, config: DockingConfig, state: DockingState): void => {
  // Absolute coordinates (considers scroll)
  const viewport: DockingViewport = config.lazyViewport(component);

  updateVisibility(component, config, state, viewport);

  Dockables.tryMorph(component, viewport, state).each((morph) => {
    applyMorph(component, config, state, viewport, morph);
  });
};

const resetInternal = (component: AlloyComponent, config: DockingConfig, state: DockingState): void => {
  // Morph back to the original position
  const elem = component.element;
  state.setDocked(false);
  const viewport = config.lazyViewport(component);
  Dockables.calculateMorphToOriginal(component, viewport, state).each(
    (staticOrAbsoluteMorph: Dockables.StaticMorph | Dockables.AbsoluteMorph) => {
      // This code is very similar to the "applyMorph" function above. The main difference
      // is that it doesn't consider fixed position, because something that is docking
      // can't currently start with fixed position
      switch (staticOrAbsoluteMorph.morph) {
        case 'static': {
          morphToStatic(component, config, state);
          break;
        }
        case 'absolute': {
          morphToCoord(component, config, state, staticOrAbsoluteMorph.positionCss);
          break;
        }
        default:
      }
    }
  );

  // Remove contextual visibility classes
  state.setVisible(true);
  config.contextual.each((contextInfo) => {
    Classes.remove(elem, [ contextInfo.fadeInClass, contextInfo.fadeOutClass, contextInfo.transitionClass ]);
    contextInfo.onShow(component);
  });

  // Apply docking again to reset the position
  refresh(component, config, state);
};

const refresh = (component: AlloyComponent, config: DockingConfig, state: DockingState): void => {
  // Ensure the component is attached to the document/world, if not then do nothing as we can't
  // check if the component should be docked or not when in a detached state
  if (component.getSystem().isConnected()) {
    refreshInternal(component, config, state);
  }
};

const reset = (component: AlloyComponent, config: DockingConfig, state: DockingState): void => {
  // If the component is not docked then there's no need to reset the state,
  // so only reset when docked
  if (state.isDocked()) {
    resetInternal(component, config, state);
  }
};

const forceDockWithDecision = (
  getDecision: (winBox: Boxes.Bounds, leftX: number, v: DockingViewport) => DockingDecision
) => (
  component: AlloyComponent,
  config: DockingConfig,
  state: DockingState
): void => {
  const viewport = config.lazyViewport(component);
  const optMorph = Dockables.forceDockWith(component.element, viewport, state, getDecision);
  optMorph.each((morph) => {
    // ASSUMPTION: This "applyFixedMorph" sets state.setDocked to true.
    applyFixedMorph(component, config, state, viewport, morph);
  });
};

const forceDockToTop = forceDockWithDecision(Dockables.forceTopPosition);

const forceDockToBottom = forceDockWithDecision(Dockables.forceBottomPosition);

const isDocked = (component: AlloyComponent, config: DockingConfig, state: DockingState): boolean =>
  state.isDocked();

const setModes = (component: AlloyComponent, config: DockingConfig, state: DockingState, modes: DockingMode[]): void =>
  state.setModes(modes);

const getModes = (component: AlloyComponent, config: DockingConfig, state: DockingState): DockingMode[] =>
  state.getModes();

export {
  refresh,
  reset,
  isDocked,
  getModes,
  setModes,
  forceDockToTop,
  forceDockToBottom
};
