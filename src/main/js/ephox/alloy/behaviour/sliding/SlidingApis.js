define(
  'ephox.alloy.behaviour.sliding.SlidingApis',

  [
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.properties.Css'
  ],

  function (Class, Classes, Css) {
    var EXPANDED = true;
    var COLLAPSED = false;

    var getAnimationRoot = function (component, slideInfo) {
      return slideInfo.getAnimationRoot().fold(function () {
        return component.element();
      }, function (get) {
        return get(component);
      });
    };

    var getDimensionProperty = function (slideInfo) {
      return slideInfo.dimension().property();
    };

    var getDimension = function (slideInfo, elem) {
      return slideInfo.dimension().getDimension()(elem);
    };

    var disableTransitions = function (component, slideInfo) {
      var root = getAnimationRoot(component, slideInfo);
      Classes.remove(root, [ slideInfo.shrinkingClass(), slideInfo.growingClass() ]);
    };

    var setShrunk = function (component, slideInfo) {
      Class.remove(component.element(), slideInfo.openClass());
      Class.add(component.element(), slideInfo.closedClass());

      Css.set(component.element(), getDimensionProperty(slideInfo), '0px');
      Css.reflow(component.element());
    };

    // Note, this is without transitions, so we can measure the size instantaneously
    var measureTargetSize = function (component, slideInfo) {
      setGrown(component, slideInfo);
      var expanded = getDimension(slideInfo, component.element());
      setShrunk(component, slideInfo);
      return expanded;
    };

    var setGrown = function (component, slideInfo) {
      Class.remove(component.element(), slideInfo.closedClass());
      Class.add(component.element(), slideInfo.openClass());
      Css.remove(component.element(), getDimensionProperty(slideInfo));
      // Reflow?
    };

    var doImmediateShrink = function (component, slideInfo) {
       slideInfo.state().set(COLLAPSED);

      // Force current dimension to begin transition
      Css.set(component.element(), getDimensionProperty(slideInfo), getDimension(slideInfo, component.element()));
      Css.reflow(component.element());

      disableTransitions(component, slideInfo);

      setShrunk(component, slideInfo);
      slideInfo.onStartShrink()(component);
      slideInfo.onShrunk()(component);
    };

    var doStartShrink = function (component, slideInfo) {
      slideInfo.state().set(COLLAPSED);

      // Force current dimension to begin transition
      Css.set(component.element(), getDimensionProperty(slideInfo), getDimension(slideInfo, component.element()));
      Css.reflow(component.element());

      var root = getAnimationRoot(component, slideInfo);
      Class.add(root, slideInfo.shrinkingClass()); // enable transitions
      setShrunk(component, slideInfo);
      slideInfo.onStartShrink()(component);
    };

    // Showing is complex due to the inability to transition to "auto".
    // We also can't cache the dimension as the parents may have resized since it was last shown.
    var doStartGrow = function (component, slideInfo) {
      var fullSize = measureTargetSize(component, slideInfo);
      
      // Start the growing animation styles
      var root = getAnimationRoot(component, slideInfo);
      Class.add(root, slideInfo.growingClass());

      setGrown(component, slideInfo);
      Css.set(component.element(), getDimensionProperty(slideInfo), fullSize);
      slideInfo.state().set(EXPANDED);
      slideInfo.onStartGrow()(component);
    };

    var grow = function (component, slideInfo) {
      if (slideInfo.state().get() !== EXPANDED) doStartGrow(component, slideInfo);
    };

    var shrink = function (component, slideInfo) {
      if (slideInfo.state().get() !== COLLAPSED) doStartShrink(component, slideInfo);
    };

    var immediateShrink = function (component, slideInfo) {
      if (slideInfo.state().get() !== COLLAPSED) doImmediateShrink(component, slideInfo);
    };

    var hasGrown = function (component, slideInfo) {
      return slideInfo.state().get() === EXPANDED;
    };

    var toggleGrow = function (component, slideInfo) {
      var f = slideInfo.state().get() === EXPANDED ? doStartShrink : doStartGrow;
      f(component, slideInfo);
    };

    return {
      grow: grow,
      shrink: shrink,
      immediateShrink: immediateShrink,
      hasGrown: hasGrown,
      toggleGrow: toggleGrow,
      disableTransitions: disableTransitions
    };
  }
);