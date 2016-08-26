define(
  'ephox.alloy.keying.CyclicType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Visibility'
  ],

  function (Keys, SystemEvents, EventHandler, ArrNavigation, KeyMatch, KeyRules, FieldSchema, Objects, Arr, Fun, Option, Compare, Focus, SelectorFilter, SelectorFind, Visibility) {
    var schema = function () {
      return [
        FieldSchema.defaulted('selector', '[data-alloy-tabstop="true"]'),
        FieldSchema.defaulted('onEscape', Fun.noop),
        FieldSchema.state('handler', function () {
          return self;
        })
      ];
    };

    // Fire an alloy focus on the first visible element that matches the selector
    var focusFirst = function (component, cyclicInfo) {
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
      findTabstop(component, cyclicInfo).each(function (tabstop) {
        // focused component
        var index = Arr.findIndex(tabstops, Fun.curry(Compare.eq, tabstop));
        cycle(tabstops, index, Visibility.isVisible).fold(function () {
          // INVESTIGATE: Should I do something here?
          // Did not find anything to move to ... kill the event anyway.
          /*
          // Didn't find anything (probably length: 0) ... go back to start?
          labby.getSystem().triggerFocus(tabstop, labby);
          labevent.stop();
          */
        }, function (outcome) {
          var system = component.getSystem();
          var originator = component.element();
          system.triggerFocus(outcome, originator);
          simulatedEvent.stop();
        });
      });
    };

    var goBackwards = function (component, simulatedEvent, cyclicInfo) {
      go(component, simulatedEvent, cyclicInfo, ArrNavigation.cyclePrev);
    };

    var goForwards = function (component, simulatedEvent, cyclicInfo) {
      go(component, simulatedEvent, cyclicInfo, ArrNavigation.cycleNext);
    };

    var exit = function (component, simulatedEvent, cyclicInfo) {
      cyclicInfo.onEscape()(component, simulatedEvent);
    };

    var rules = [
      KeyRules.rule( KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), goBackwards),
      KeyRules.rule( KeyMatch.inSet( Keys.TAB() ), goForwards),
      KeyRules.rule( KeyMatch.inSet( Keys.ESCAPE()), exit)
    ];

    var processKey = function (component, simulatedEvent, cyclicInfo) {
      KeyRules.choose(rules, simulatedEvent.event()).each(function (transition) {
        transition(component, simulatedEvent, cyclicInfo);
      });
    };

    var toEvents = function (cyclicInfo) {
      return Objects.wrapAll([
        { 
          key: SystemEvents.focus(),
          value: EventHandler.nu({
            run: function (component) {
              focusFirst(component, cyclicInfo);
            }
          })
        },
        {
          key: 'keydown',
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              return processKey(component, simulatedEvent, cyclicInfo);
            }
          })
        }
      ]);
    };

    var self = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents,
      toApis: Fun.constant({ })
    };

    return self;
  }
);