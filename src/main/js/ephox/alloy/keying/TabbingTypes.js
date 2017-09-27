define(
  'ephox.alloy.keying.TabbingTypes',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.keying.KeyingType',
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

  function (Keys, NoState, KeyingType, ArrNavigation, KeyMatch, KeyRules, FieldSchema, Arr, Fun, Option, Compare, Focus, SelectorFilter, SelectorFind, Height) {
    var create = function (cyclicField) {
      var schema = [
        FieldSchema.option('onEscape'),
        FieldSchema.option('onEnter'),
        FieldSchema.defaulted('selector', '[data-alloy-tabstop="true"]'),
        FieldSchema.defaulted('firstTabstop', 0),
        FieldSchema.defaulted('useTabstopAt', Fun.constant(true)),
        // Maybe later we should just expose isVisible
        FieldSchema.option('visibilitySelector')
      ].concat([
        cyclicField
      ]);

      // TODO: Test this
      var isVisible = function (tabbingConfig, element) {
        var target = tabbingConfig.visibilitySelector().bind(function (sel) {
          return SelectorFind.closest(element, sel);
        }).getOr(element);

        // NOTE: We can't use Visibility.isVisible, because the toolbar has width when it has closed, just not height.
        return Height.get(target) > 0;
      };

      var findInitial = function (component, tabbingConfig) {
        var tabstops = SelectorFilter.descendants(component.element(), tabbingConfig.selector());
        var visibles = Arr.filter(tabstops, function (elem) {
          return isVisible(tabbingConfig, elem);
        });

        return Option.from(visibles[tabbingConfig.firstTabstop()]);
      };

      var findCurrent = function (component, tabbingConfig) {
        return tabbingConfig.focusManager().get(component).bind(function (elem) {
          return SelectorFind.closest(elem, tabbingConfig.selector());
        });
      };

      var isTabstop = function (tabbingConfig, element) {
        return isVisible(tabbingConfig, element) && tabbingConfig.useTabstopAt(element);
      };

      // Fire an alloy focus on the first visible element that matches the selector
      var focusIn = function (component, tabbingConfig, tabbingState) {
        findInitial(component, tabbingConfig).each(function (target) {
          tabbingConfig.focusManager().set(component, target);
        });
      };

      var goFromTabstop = function (component, tabstops, stopIndex, tabbingConfig, cycle) {
        return cycle(tabstops, stopIndex, function (elem) {
          return isTabstop(tabbingConfig, elem);
        }).fold(function () {
          // Even if there is only one, still capture the event if cycling
          return tabbingConfig.cyclic() ? Option.some(true) : Option.none();
        }, function (target) {
          tabbingConfig.focusManager().set(component, target);
          // Kill the event
          return Option.some(true);
        });
      };

      var go = function (component, simulatedEvent, tabbingConfig, cycle) {
        // 1. Find our current tabstop
        // 2. Find the index of that tabstop
        // 3. Cycle the tabstop
        // 4. Fire alloy focus on the resultant tabstop
        var tabstops = SelectorFilter.descendants(component.element(), tabbingConfig.selector());
        return findCurrent(component, tabbingConfig).bind(function (tabstop) {
          // focused component
          var optStopIndex = Arr.findIndex(tabstops, Fun.curry(Compare.eq, tabstop));

          return optStopIndex.bind(function (stopIndex) {
            return goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle);
          });
        });
      };

      var goBackwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
        var navigate = tabbingConfig.cyclic() ? ArrNavigation.cyclePrev : ArrNavigation.tryPrev;
        return go(component, simulatedEvent, tabbingConfig, navigate);
      };

      var goForwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
        var navigate = tabbingConfig.cyclic() ? ArrNavigation.cycleNext : ArrNavigation.tryNext;
        return go(component, simulatedEvent, tabbingConfig, navigate);
      };

      var execute = function (component, simulatedEvent, tabbingConfig, tabbingState) {
        return tabbingConfig.onEnter().bind(function (f) {
          return f(component, simulatedEvent);
        });
      };

      var exit = function (component, simulatedEvent, tabbingConfig, tabbingState) {
        return tabbingConfig.onEscape().bind(function (f) {
          return f(component, simulatedEvent);
        });
      };

      var getRules = Fun.constant([
        KeyRules.rule(KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), goBackwards),
        KeyRules.rule(KeyMatch.inSet(Keys.TAB()), goForwards),
        KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), exit),
        KeyRules.rule(KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.ENTER()) ]), execute)
      ]);

      var getEvents = Fun.constant({ });
      var getApis = Fun.constant({ });

      return KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));
    };

    return {
      create: create
    };
  }
);