import { Class, Classes, Css } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SlidingConfig } from '../../behaviour/sliding/SlidingTypes';
import { getAnimationRoot } from './SlidingUtils';
import { Option } from '@ephox/katamari';

const getDimensionProperty = (slideConfig) => {
  return slideConfig.dimension().property();
};

const getDimension = (slideConfig, elem) => {
  return slideConfig.dimension().getDimension()(elem);
};

const disableTransitions = (component: AlloyComponent, slideConfig: SlidingConfig) => {
  const root = getAnimationRoot(component, slideConfig);
  Classes.remove(root, [ slideConfig.shrinkingClass, slideConfig.growingClass ]);
};

const setShrunk = (component: AlloyComponent, slideConfig: SlidingConfig) => {
  Class.remove(component.element(), slideConfig.openClass);
  Class.add(component.element(), slideConfig.closedClass);
  Css.set(component.element(), getDimensionProperty(slideConfig), '0px');
  Css.reflow(component.element());
};

const setGrown = (component: AlloyComponent, slideConfig: SlidingConfig) => {
  Class.remove(component.element(), slideConfig.closedClass);
  Class.add(component.element(), slideConfig.openClass);
  Css.remove(component.element(), getDimensionProperty(slideConfig));
};

const doImmediateShrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState, _calculatedSize: Option<string>) => {
  slideState.setCollapsed();

  // Force current dimension to begin transition
  Css.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
  Css.reflow(component.element());

  disableTransitions(component, slideConfig);

  setShrunk(component, slideConfig);
  slideConfig.onStartShrink(component);
  slideConfig.onShrunk(component);
};

const doStartShrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState, calculatedSize: Option<string>) => {
  const size = calculatedSize.getOrThunk(() => getDimension(slideConfig, component.element()));
  slideState.setCollapsed();

  // Force current dimension to begin transition
  Css.set(component.element(), getDimensionProperty(slideConfig), size);
  Css.reflow(component.element());

  const root = getAnimationRoot(component, slideConfig);
  Class.add(root, slideConfig.shrinkingClass); // enable transitions
  setShrunk(component, slideConfig);
  slideConfig.onStartShrink(component);
};

// A "smartShrink" will do an immediate shrink if no shrinking is scheduled to happen
const doStartSmartShrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  const size: string = getDimension(slideConfig, component.element());
  const shrinker = size === '0px' ? doImmediateShrink : doStartShrink;
  shrinker(component, slideConfig, slideState, Option.some(size));
};

// Showing is complex due to the inability to transition to "auto".
// We also can't cache the dimension as the parents may have resized since it was last shown.
const doStartGrow = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  setGrown(component, slideConfig);
  const fullSize = getDimension(slideConfig, component.element());
  setShrunk(component, slideConfig);

  // Start the growing animation styles
  const root = getAnimationRoot(component, slideConfig);
  Class.add(root, slideConfig.growingClass);

  setGrown(component, slideConfig);

  Css.set(component.element(), getDimensionProperty(slideConfig), fullSize);
  // We might need to consider having a Css.reflow here. We can't have it in setGrown because
  // it stops the transition immediately because it jumps to the final size.

  slideState.setExpanded();
  slideConfig.onStartGrow(component);
};

const grow = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  if (! slideState.isExpanded()) { doStartGrow(component, slideConfig, slideState); }
};

const shrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  if (slideState.isExpanded()) { doStartSmartShrink(component, slideConfig, slideState); }
};

const immediateShrink = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  if (slideState.isExpanded()) { doImmediateShrink(component, slideConfig, slideState, Option.none()); }
};

const hasGrown = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  return slideState.isExpanded();
};

const hasShrunk = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  return slideState.isCollapsed();
};

const isGrowing = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  const root = getAnimationRoot(component, slideConfig);
  return Class.has(root, slideConfig.growingClass) === true;
};

const isShrinking = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  const root = getAnimationRoot(component, slideConfig);
  return Class.has(root, slideConfig.shrinkingClass) === true;
};

const isTransitioning = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  return isGrowing(component, slideConfig, slideState) === true || isShrinking(component, slideConfig, slideState) === true;
};

const toggleGrow = (component: AlloyComponent, slideConfig: SlidingConfig, slideState) => {
  const f = slideState.isExpanded() ? doStartSmartShrink : doStartGrow;
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