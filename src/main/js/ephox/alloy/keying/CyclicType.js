define(
  'ephox.alloy.keying.CyclicType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Visibility'
  ],

  function (Keys, KeyingType, ArrNavigation, KeyMatch, KeyRules, FieldSchema, Arr, Fun, Option, Compare, Focus, SelectorFilter, SelectorFind, Visibility) {
    var schema = [
      FieldSchema.defaulted('selector', '[data-alloy-tabstop="true"]'),
      FieldSchema.option('onEscape'),
      FieldSchema.option('onEnter')
    ];

    // Fire an alloy focus on the first visible element that matches the selector
    var focusIn = function (component, cyclicInfo) {
      var tabstops = SelectorFilter.descendants(component.element(), cyclicInfo.selector());
      var visible = Arr.filter(tabstops, Visibility.isVisible);
      Option.from(visible[0]).each(function (target) {
        var originator = component.element();
        component.getSystem().triggerFocus(target, originator);
      });
    };

    var findTabstop = function (component, cyclicInfo) {
      return Focus.search(component.element()).bind(function (elem) {
        return SelectorFind.closest(elem, cyclicInfo.selector());
      });
    };

    var go = function (component, simulatedEvent, cyclicInfo, cycle) {
      // 1. Find our current tabstop
      // 2. Find the index of that tabstop
      // 3. Cycle the tabstop
      // 4. Fire alloy focus on the resultant tabstop
      var tabstops = SelectorFilter.descendants(component.element(), cyclicInfo.selector());
      return findTabstop(component, cyclicInfo).bind(function (tabstop) {
        // focused component
        var index = Arr.findIndex(tabstops, Fun.curry(Compare.eq, tabstop));
        return cycle(tabstops, index, Visibility.isVisible).map(function (outcome) {
          var system = component.getSystem();
          var originator = component.element();
          system.triggerFocus(outcome, originator);

          // Kill the event
          return true;
        });
      });
    };

    var goBackwards = function (component, simulatedEvent, cyclicInfo) {
      return go(component, simulatedEvent, cyclicInfo, ArrNavigation.cyclePrev);
    };

    var goForwards = function (component, simulatedEvent, cyclicInfo) {
      return go(component, simulatedEvent, cyclicInfo, ArrNavigation.cycleNext);
    };

    var execute = function (component, simulatedEvent, cyclicInfo) {
      return cyclicInfo.onEnter().map(function (f) {
        f(component, simulatedEvent);
        return true;
      });
    };

    var exit = function (component, simulatedEvent, cyclicInfo) {
      return cyclicInfo.onEscape().map(function (f) {
        f(component, simulatedEvent);
        return true;
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

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);