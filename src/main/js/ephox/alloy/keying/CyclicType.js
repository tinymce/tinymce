define(
  'ephox.alloy.keying.CyclicType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.log.AlloyLogger',
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, KeyingType, AlloyLogger, ArrNavigation, KeyMatch, KeyRules, FieldSchema, Arr, Fun, Option, Compare, Focus, Height, SelectorFilter, SelectorFind) {
    var schema = [
      FieldSchema.defaulted('selector', '[data-alloy-tabstop="true"]'),
      FieldSchema.option('onEscape'),
      FieldSchema.option('onEnter'),
      FieldSchema.defaulted('firstTabstop', 0),
      FieldSchema.defaulted('useTabstopAt', Fun.constant(true)),
      // Maybe later we should just expose isVisible
      FieldSchema.option('visibilitySelector')
    ];

    // Fire an alloy focus on the first visible element that matches the selector
    var focusIn = function (component, cyclicInfo) {
      var tabstops = SelectorFilter.descendants(component.element(), cyclicInfo.selector());
      var visibles = Arr.filter(tabstops, function (elem) {
        return isVisible(cyclicInfo, elem);
      });

      console.log('first', cyclicInfo.firstTabstop());

      var visibleOpt = Option.from(visibles[cyclicInfo.firstTabstop()]);

      visibleOpt.each(function (target) {
        var originator = component.element();
        component.getSystem().triggerFocus(target, originator);
      });
    };

    // TODO: Test this
    var isVisible = function (cyclicInfo, element) {
      var target = cyclicInfo.visibilitySelector().bind(function (sel) {
        return SelectorFind.closest(element, sel);
      }).getOr(element);

      // NOTE: We can't use Visibility.isVisible, because the toolbar has width when it has closed, just not height.
      return Height.get(target) > 0;
    };

    var findTabstop = function (component, cyclicInfo) {
      return Focus.search(component.element()).bind(function (elem) {
        return SelectorFind.closest(elem, cyclicInfo.selector());
      });
    };

    var logFailed = function (index, tabstops) {
      console.log('pressing tab failed');
    };

    var logSuccess = function (cyclicInfo, index, tabstops, originator, destination) {
      console.log('*** Cyclic movement: SUCCESS ***');
      console.log('Original index in tabstops: ' + index);
      console.log('Tabstops: ', Arr.map(tabstops, AlloyLogger.element));
      console.log('Originator: ', originator.dom());
      console.log('Destination: ', destination.dom(), ':visible', isVisible(cyclicInfo, destination), Height.get(destination));
      console.log('********');

    }

    var go = function (component, simulatedEvent, cyclicInfo, cycle) {
      // 1. Find our current tabstop
      // 2. Find the index of that tabstop
      // 3. Cycle the tabstop
      // 4. Fire alloy focus on the resultant tabstop
      var tabstops = SelectorFilter.descendants(component.element(), cyclicInfo.selector());
      return findTabstop(component, cyclicInfo).bind(function (tabstop) {
        // focused component
        var index = Arr.findIndex(tabstops, Fun.curry(Compare.eq, tabstop));
        return index < 0 ? Option.none() : cycle(tabstops, index, function (elem) {
          return isVisible(cyclicInfo, elem) && cyclicInfo.useTabstopAt(elem);
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
      });
    };

    var goBackwards = function (component, simulatedEvent, cyclicInfo) {
      return go(component, simulatedEvent, cyclicInfo, ArrNavigation.cyclePrev);
    };

    var goForwards = function (component, simulatedEvent, cyclicInfo) {
      return go(component, simulatedEvent, cyclicInfo, ArrNavigation.cycleNext);
    };

    var execute = function (component, simulatedEvent, cyclicInfo) {
      return cyclicInfo.onEnter().bind(function (f) {
        return f(component, simulatedEvent);
      });
    };

    var exit = function (component, simulatedEvent, cyclicInfo) {
      return cyclicInfo.onEscape().bind(function (f) {
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

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);