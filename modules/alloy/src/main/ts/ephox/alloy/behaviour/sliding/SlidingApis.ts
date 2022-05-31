import { Optional } from '@ephox/katamari';
import { Class, Classes, Css, SugarElement } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { SlidingConfig, SlidingState } from './SlidingTypes';
import { getAnimationRoot } from './SlidingUtils';

const getDimensionProperty = (slideConfig: SlidingConfig): string =>
  slideConfig.dimension.property;

const getDimension = (slideConfig: SlidingConfig, elem: SugarElement<HTMLElement>): string =>
  slideConfig.dimension.getDimension(elem);

const disableTransitions = (component: AlloyComponent, slideConfig: SlidingConfig): void => {
  const root = getAnimationRoot(component, slideConfig);
  Classes.remove(root, [ slideConfig.shrinkingClass, slideConfig.growingClass ]);
};

const setShrunk = (component: AlloyComponent, slideConfig: SlidingConfig): void => {
  Class.remove(component.element, slideConfig.openClass);
  Class.add(component.element, slideConfig.closedClass);
  Css.set(component.element, getDimensionProperty(slideConfig), '0px');
  Css.reflow(component.element);
};

const setGrown = (component: AlloyComponent, slideConfig: SlidingConfig): void => {
  Class.remove(component.element, slideConfig.closedClass);
  Class.add(component.element, slideConfig.openClass);
  Css.remove(component.element, getDimensionProperty(slideConfig));
};

const doImmediateShrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState, _calculatedSize: Optional<string>): void => {
  slideState.setCollapsed();

  // Force current dimension to begin transition
  Css.set(component.element, getDimensionProperty(slideConfig), getDimension(slideConfig, component.element));
  // TINY-8710: we don't think reflow is required (as has been done elsewhere) as the animation is not needed

  disableTransitions(component, slideConfig);

  setShrunk(component, slideConfig);
  slideConfig.onStartShrink(component);
  slideConfig.onShrunk(component);
};

const doStartShrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState, calculatedSize: Optional<string>): void => {
  const size = calculatedSize.getOrThunk(() => getDimension(slideConfig, component.element));
  slideState.setCollapsed();

  // Force current dimension to begin transition
  Css.set(component.element, getDimensionProperty(slideConfig), size);
  Css.reflow(component.element);

  const root = getAnimationRoot(component, slideConfig);
  Class.remove(root, slideConfig.growingClass);
  Class.add(root, slideConfig.shrinkingClass); // enable transitions
  setShrunk(component, slideConfig);
  slideConfig.onStartShrink(component);
};

// A "smartShrink" will do an immediate shrink if no shrinking is scheduled to happen
const doStartSmartShrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): void => {
  const size: string = getDimension(slideConfig, component.element);
  const shrinker = size === '0px' ? doImmediateShrink : doStartShrink;
  shrinker(component, slideConfig, slideState, Optional.some(size));
};

// Showing is complex due to the inability to transition to "auto".
// We also can't cache the dimension as the parents may have resized since it was last shown.
const doStartGrow = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): void => {
  // Start the growing animation styles
  const root = getAnimationRoot(component, slideConfig);

  // Record whether this is interrupting a shrink and its current size
  const wasShrinking = Class.has(root, slideConfig.shrinkingClass);
  const beforeSize = getDimension(slideConfig, component.element);
  setGrown(component, slideConfig);
  const fullSize = getDimension(slideConfig, component.element);

  // If the grow is interrupting a shrink, use the size from before the grow as the start size
  // And reflow so that the animation works.
  const startPartialGrow = () => {
    Css.set(component.element, getDimensionProperty(slideConfig), beforeSize);
    Css.reflow(component.element);
  };

  // If the grow is not interrupting a shrink, start from 0 (shrunk)
  const startCompleteGrow = () => {
    setShrunk(component, slideConfig);
  };

  // Determine what the initial size for the grow operation should be.
  const setStartSize = wasShrinking ? startPartialGrow : startCompleteGrow;
  setStartSize();

  Class.remove(root, slideConfig.shrinkingClass);
  Class.add(root, slideConfig.growingClass);

  setGrown(component, slideConfig);

  Css.set(component.element, getDimensionProperty(slideConfig), fullSize);
  slideState.setExpanded();
  slideConfig.onStartGrow(component);
};

const refresh = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): void => {
  if (slideState.isExpanded()) {
    Css.remove(component.element, getDimensionProperty(slideConfig));
    const fullSize = getDimension(slideConfig, component.element);
    Css.set(component.element, getDimensionProperty(slideConfig), fullSize);
  }
};

const grow = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): void => {
  if (!slideState.isExpanded()) {
    doStartGrow(component, slideConfig, slideState);
  }
};

const shrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): void => {
  if (slideState.isExpanded()) {
    doStartSmartShrink(component, slideConfig, slideState);
  }
};

const immediateShrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): void => {
  if (slideState.isExpanded()) {
    doImmediateShrink(component, slideConfig, slideState, Optional.none());
  }
};

const hasGrown = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): boolean =>
  slideState.isExpanded();

const hasShrunk = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): boolean =>
  slideState.isCollapsed();

const isGrowing = (component: AlloyComponent, slideConfig: SlidingConfig, _slideState: SlidingState): boolean => {
  const root = getAnimationRoot(component, slideConfig);
  return Class.has(root, slideConfig.growingClass) === true;
};

const isShrinking = (component: AlloyComponent, slideConfig: SlidingConfig, _slideState: SlidingState): boolean => {
  const root = getAnimationRoot(component, slideConfig);
  return Class.has(root, slideConfig.shrinkingClass) === true;
};

const isTransitioning = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): boolean =>
  isGrowing(component, slideConfig, slideState) || isShrinking(component, slideConfig, slideState);

const toggleGrow = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): void => {
  const f = slideState.isExpanded() ? doStartSmartShrink : doStartGrow;
  f(component, slideConfig, slideState);
};

const immediateGrow = (component: AlloyComponent, slideConfig: SlidingConfig, slideState: SlidingState): void => {
  if (!slideState.isExpanded()) {
    setGrown(component, slideConfig);
    Css.set(component.element, getDimensionProperty(slideConfig), getDimension(slideConfig, component.element));
    // TINY-8710: we don't think reflow is required (as has been done elsewhere) as the animation is not needed
    // Keep disableTransition to handle the case where it's part way through transitioning
    disableTransitions(component, slideConfig);
    slideState.setExpanded();
    slideConfig.onStartGrow(component);
    slideConfig.onGrown(component);
  }
};

export {
  refresh,
  grow,
  shrink,
  immediateShrink,
  hasGrown,
  hasShrunk,
  isGrowing,
  isShrinking,
  isTransitioning,
  toggleGrow,
  disableTransitions,
  immediateGrow
};
