define(
  'ephox.alloy.behaviour.sliding.SlidingApis',

  [
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.properties.Css'
  ],

  function (Class, Classes, Css) {
    var getAnimationRoot = function (component, slideConfig) {
      return slideConfig.getAnimationRoot().fold(function () {
        return component.element();
      }, function (get) {
        return get(component);
      });
    };

    var disableTransitions = function (component, slideConfig) {
      var root = getAnimationRoot(component, slideConfig);
      Classes.remove(root, [ slideConfig.shrinkingClass(), slideConfig.growingClass() ]);
    };

    var setShrunk = function (component, slideConfig) {
      Class.remove(component.element(), slideConfig.openClass());
      Class.add(component.element(), slideConfig.closedClass());

      slideConfig.dimension().startShrink()(component, slideConfig);
      Css.reflow(component.element());
    };

    // Note, this is without transitions, so we can measure the size instantaneously
    var measureTargetSize = function (component, slideConfig) {
      setGrown(component, slideConfig);
      var expanded = slideConfig.dimension().getDimension()(component.element());
      setShrunk(component, slideConfig);
      return expanded;
    };

    var setGrown = function (component, slideConfig) {
      Class.remove(component.element(), slideConfig.closedClass());
      Class.add(component.element(), slideConfig.openClass());
      slideConfig.dimension().clearSize()(component, slideConfig);
      // Reflow?
    };

    var doImmediateShrink = function (component, slideConfig, slideState) {
      slideState.setCollapsed();

      // Force current dimension to begin transition
      slideConfig.dimension().forceSize()(component, slideConfig, slideState);

      disableTransitions(component, slideConfig);

      setShrunk(component, slideConfig);
      slideConfig.onStartShrink()(component);
      slideConfig.onShrunk()(component);
    };

    var doStartShrink = function (component, slideConfig, slideState) {
      slideState.setCollapsed();

      // Force current dimension to begin transition
      slideConfig.dimension().forceSize()(component, slideConfig, slideState);

      var root = getAnimationRoot(component, slideConfig);
      Class.add(root, slideConfig.shrinkingClass()); // enable transitions
      setShrunk(component, slideConfig);

      slideConfig.onStartShrink()(component);
    };

    // Showing is complex due to the inability to transition to "auto".
    // We also can't cache the dimension as the parents may have resized since it was last shown.
    var doStartGrow = function (component, slideConfig, slideState) {
      var fullSize = measureTargetSize(component, slideConfig);
      
      // Start the growing animation styles
      var root = getAnimationRoot(component, slideConfig);
      Class.add(root, slideConfig.growingClass());

      setGrown(component, slideConfig);
      slideConfig.dimension().setSize()(component, slideConfig, fullSize);
      slideState.setExpanded();
      slideConfig.onStartGrow()(component);
    };

    var grow = function (component, slideConfig, slideState) {
      if (! slideState.isExpanded()) doStartGrow(component, slideConfig, slideState);
    };

    var shrink = function (component, slideConfig, slideState) {
      if (slideState.isExpanded()) doStartShrink(component, slideConfig, slideState);
    };

    var immediateShrink = function (component, slideConfig, slideState) {
      if (slideState.isExpanded()) doImmediateShrink(component, slideConfig, slideState);
    };

    var hasGrown = function (component, slideConfig, slideState) {
      return slideState.isExpanded();
    };

    var toggleGrow = function (component, slideConfig, slideState) {
      var f = slideState.isExpanded() ? doStartShrink : doStartGrow;
      f(component, slideConfig, slideState);
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