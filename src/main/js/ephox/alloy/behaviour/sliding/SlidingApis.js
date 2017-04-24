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

    var getDimensionProperty = function (slideConfig) {
      return slideConfig.dimension().property();
    };

    var getDimension = function (slideConfig, elem) {
      return slideConfig.dimension().getDimension()(elem);
    };

    var disableTransitions = function (component, slideConfig) {
      var root = getAnimationRoot(component, slideConfig);
      Classes.remove(root, [ slideConfig.shrinkingClass(), slideConfig.growingClass() ]);
    };

    var setShrunk = function (component, slideConfig) {
      Class.remove(component.element(), slideConfig.openClass());
      Class.add(component.element(), slideConfig.closedClass());

      Css.set(component.element(), getDimensionProperty(slideConfig), '0px');
      Css.reflow(component.element());
    };

    // Note, this is without transitions, so we can measure the size instantaneously
    var measureTargetSize = function (component, slideConfig) {
      setGrown(component, slideConfig);
      var expanded = getDimension(slideConfig, component.element());
      setShrunk(component, slideConfig);
      return expanded;
    };

    var setGrown = function (component, slideConfig) {
      Class.remove(component.element(), slideConfig.closedClass());
      Class.add(component.element(), slideConfig.openClass());
      Css.remove(component.element(), getDimensionProperty(slideConfig));
      // Reflow?
    };

    var doImmediateShrink = function (component, slideConfig, slideState) {
      slideState.setCollapsed();

      // Force current dimension to begin transition
      Css.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
      Css.reflow(component.element());

      disableTransitions(component, slideConfig);

      setShrunk(component, slideConfig);
      slideConfig.onStartShrink()(component);
      slideConfig.onShrunk()(component);
    };

    var doStartShrink = function (component, slideConfig, slideState) {
      slideState.setCollapsed();

      // Force current dimension to begin transition
      Css.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
      Css.reflow(component.element());

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
      Css.set(component.element(), getDimensionProperty(slideConfig), fullSize);
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