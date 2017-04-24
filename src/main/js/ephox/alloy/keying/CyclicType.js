define(
  'ephox.alloy.keying.CyclicType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.log.AlloyLogger',
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Height'
  ],

  function (Keys, NoState, KeyingType, AlloyLogger, ArrNavigation, KeyMatch, KeyRules, FieldSchema, Arr, Fun, Option, Compare, Focus, SelectorFilter, SelectorFind, Height) {
    var schema = [
      FieldSchema.defaulted('selector', '[data-alloy-tabstop="true"]'),
      FieldSchema.option('onEscape'),
      FieldSchema.option('onEnter'),
      FieldSchema.defaulted('firstTabstop', 0),
      FieldSchema.defaulted('useTabstopAt', Fun.constant(true)),
      // Maybe later we should just expose isVisible
      FieldSchema.option('visibilitySelector'),
      FieldSchema.state('state', Fun.constant(NoState.init))
    ];

    // Fire an alloy focus on the first visible element that matches the selector
    var focusIn = function (component, cyclicConfig, cyclicState) {
      var tabstops = SelectorFilter.descendants(component.element(), cyclicConfig.selector());
      var visibles = Arr.filter(tabstops, function (elem) {
        return isVisible(cyclicConfig, elem);
      });

      var visibleOpt = Option.from(visibles[cyclicConfig.firstTabstop()]);

      visibleOpt.each(function (target) {
        var originator = component.element();
        component.getSystem().triggerFocus(target, originator);
      });
    };

    // TODO: Test this
    var isVisible = function (cyclicConfig, element) {
      var target = cyclicConfig.visibilitySelector().bind(function (sel) {
        return SelectorFind.closest(element, sel);
      }).getOr(element);

      // NOTE: We can't use Visibility.isVisible, because the toolbar has width when it has closed, just not height.
      return Height.get(target) > 0;
    };

    var findTabstop = function (component, cyclicConfig) {
      return Focus.search(component.element()).bind(function (elem) {
        return SelectorFind.closest(elem, cyclicConfig.selector());
      });
    };

    var goFromTabstop = function (component, tabstops, stopIndex, cyclicConfig, cycle) {
      return cycle(tabstops, stopIndex, function (elem) {
        return isVisible(cyclicConfig, elem) && cyclicConfig.useTabstopAt(elem);
      }).fold(function () {
        // Even if there is only one, still capture the event.
        // logFailed(index, tabstops);
        return Option.some(true);
      }, function (outcome) {
        // logSuccess(cyclicInfo, index, tabstops, component.element(), outcome);
        var system = component.getSystem();
        var originator = component.element();
        system.triggerFocus(outcome, originator);
        // Kill the event
        return Option.some(true);
      });
    };

    var go = function (component, simulatedEvent, cyclicConfig, cycle) {
      // 1. Find our current tabstop
      // 2. Find the index of that tabstop
      // 3. Cycle the tabstop
      // 4. Fire alloy focus on the resultant tabstop
      var tabstops = SelectorFilter.descendants(component.element(), cyclicConfig.selector());
      return findTabstop(component, cyclicConfig).bind(function (tabstop) {
        // focused component
        var optStopIndex = Arr.findIndex(tabstops, Fun.curry(Compare.eq, tabstop));

        return optStopIndex.bind(function (stopIndex) {
          return goFromTabstop(component, tabstops, stopIndex, cyclicConfig, cycle);
        });
      });
    };

    var goBackwards = function (component, simulatedEvent, cyclicConfig, cyclicState) {
      return go(component, simulatedEvent, cyclicConfig, ArrNavigation.cyclePrev);
    };

    var goForwards = function (component, simulatedEvent, cyclicConfig, cyclicState) {
      return go(component, simulatedEvent, cyclicConfig, ArrNavigation.cycleNext);
    };

    var execute = function (component, simulatedEvent, cyclicConfig, cyclicState) {
      return cyclicConfig.onEnter().bind(function (f) {
        return f(component, simulatedEvent);
      });
    };

    var exit = function (component, simulatedEvent, cyclicConfig, cyclicState) {
      return cyclicConfig.onEscape().bind(function (f) {
        return f(component, simulatedEvent);
      });
    };

    var getRules = Fun.constant([
      KeyRules.rule( KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), goBackwards),
      KeyRules.rule( KeyMatch.inSet( Keys.TAB() ), goForwards),
      KeyRules.rule( KeyMatch.inSet( Keys.ESCAPE()), exit),
      KeyRules.rule( KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet( Keys.ENTER()) ]), execute)
    ]);

    var getEvents = Fun.constant({ });
    var getApis = Fun.constant({ });

    return KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));
  }
);