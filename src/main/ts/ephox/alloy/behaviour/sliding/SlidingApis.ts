import { Class, Classes, Css } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SlidingConfig } from '../../behaviour/sliding/SlidingTypes';

const getAnimationRoot = function (component: AlloyComponent, slideConfig: SlidingConfig) {
  return slideConfig.getAnimationRoot().fold(function () {
    return component.element();
  }, function (get) {
    return get(component);
  });
};

const getDimensionProperty = function (slideConfig) {
  return slideConfig.dimension().property();
};

const getDimension = function (slideConfig, elem) {
  return slideConfig.dimension().getDimension()(elem);
};

const disableTransitions = function (component: AlloyComponent, slideConfig: SlidingConfig) {
  const root = getAnimationRoot(component, slideConfig);
  Classes.remove(root, [ slideConfig.shrinkingClass(), slideConfig.growingClass() ]);
};

const setShrunk = function (component: AlloyComponent, slideConfig: SlidingConfig) {
  Class.remove(component.element(), slideConfig.openClass());
  Class.add(component.element(), slideConfig.closedClass());
  Css.set(component.element(), getDimensionProperty(slideConfig), '0px');
  Css.reflow(component.element());
};

// Note, this is without transitions, so we can measure the size instantaneously
const measureTargetSize = function (component: AlloyComponent, slideConfig: SlidingConfig) {
  setGrown(component, slideConfig);
  const expanded = getDimension(slideConfig, component.element());
  setShrunk(component, slideConfig);
  return expanded;
};

const setGrown = function (component: AlloyComponent, slideConfig: SlidingConfig) {
  Class.remove(component.element(), slideConfig.closedClass());
  Class.add(component.element(), slideConfig.openClass());
  Css.remove(component.element(), getDimensionProperty(slideConfig));
};

const doImmediateShrink = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  slideState.setCollapsed();

  // Force current dimension to begin transition
  Css.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
  Css.reflow(component.element());

  disableTransitions(component, slideConfig);

  setShrunk(component, slideConfig);
  slideConfig.onStartShrink()(component);
  slideConfig.onShrunk()(component);
};

const doStartShrink = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  slideState.setCollapsed();

  // Force current dimension to begin transition
  Css.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
  Css.reflow(component.element());

  const root = getAnimationRoot(component, slideConfig);
  Class.add(root, slideConfig.shrinkingClass()); // enable transitions
  setShrunk(component, slideConfig);
  slideConfig.onStartShrink()(component);
};

// Showing is complex due to the inability to transition to "auto".
// We also can't cache the dimension as the parents may have resized since it was last shown.
const doStartGrow = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  const fullSize = measureTargetSize(component, slideConfig);

  // Start the growing animation styles
  const root = getAnimationRoot(component, slideConfig);
  Class.add(root, slideConfig.growingClass());

  setGrown(component, slideConfig);

  Css.set(component.element(), getDimensionProperty(slideConfig), fullSize);
  // We might need to consider having a Css.reflow here. We can't have it in setGrown because
  // it stops the transition immediately because it jumps to the final size.

  slideState.setExpanded();
  slideConfig.onStartGrow()(component);
};

const grow = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  if (! slideState.isExpanded()) { doStartGrow(component, slideConfig, slideState); }
};

const shrink = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  if (slideState.isExpanded()) { doStartShrink(component, slideConfig, slideState); }
};

const immediateShrink = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  if (slideState.isExpanded()) { doImmediateShrink(component, slideConfig, slideState); }
};

const hasGrown = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  return slideState.isExpanded();
};

const hasShrunk = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  return slideState.isCollapsed();
};

const isGrowing = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  const root = getAnimationRoot(component, slideConfig);
  return Class.has(root, slideConfig.growingClass()) === true;
};

const isShrinking = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  const root = getAnimationRoot(component, slideConfig);
  return Class.has(root, slideConfig.shrinkingClass()) === true;
};

const isTransitioning = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  return isGrowing(component, slideConfig, slideState) === true || isShrinking(component, slideConfig, slideState) === true;
};

const toggleGrow = function (component: AlloyComponent, slideConfig: SlidingConfig, slideState) {
  const f = slideState.isExpanded() ? doStartShrink : doStartGrow;
  f(component, slideConfig, slideState);
};

export {
  grow,
  shrink,
  immediateShrink,
  hasGrown,
  hasShrunk,
  isGrowing,
  isShrinking,
  isTransitioning,
  toggleGrow,
  disableTransitions
};