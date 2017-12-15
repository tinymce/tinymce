import { Assertions } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Debugging from 'ephox/alloy/debugging/Debugging';
import Triggers from 'ephox/alloy/events/Triggers';
import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Insert } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('TriggersTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var log = [ ];

  var make = function (stop, message) {
    return function (labEvent) {
      log.push(message);
      if (stop) labEvent.stop();
    };
  };

  // OK for this test, we need to start with a list of events which may or may not stop
  var domEvents = {
    'no.stop': {
      'alpha': make(false, 'alpha'),
      'beta': make(false, 'beta'),
      'gamma': make(false, 'gamma')
    },
    'gamma.stop': {
      'alpha': make(false, 'alpha'),
      'beta': make(false, 'beta'),
      'gamma': make(true, 'gamma')
    },
    'beta.stop': {
      'alpha': make(false, 'alpha'),
      'beta': make(true, 'beta'),
      'gamma': make(false, 'gamma')
    },
    'alpha.stop': {
      'alpha': make(true, 'alpha'),
      'beta': make(false, 'beta'),
      'gamma': make(false, 'gamma')
    },
    'gamma.alpha.stop': {
      'alpha': make(true, 'alpha'),
      'beta': make(false, 'beta'),
      'gamma': make(true, 'gamma')
    },
    'gamma.beta.stop': {
      'alpha': make(false, 'alpha'),
      'beta': make(true, 'beta'),
      'gamma': make(true, 'gamma')
    },
    'beta.alpha.stop': {
      'alpha': make(true, 'alpha'),
      'beta': make(true, 'beta'),
      'gamma': make(false, 'gamma')
    },
    'all.stop': {
      'alpha': make(true, 'alpha'),
      'beta': make(true, 'beta'),
      'gamma': make(true, 'gamma')
    }
  };

  var logger = Debugging.noLogger();

  var lookup = function (eventType, target) {
    var targetId = Attr.get(target, 'data-event-id');

    return Objects.readOptFrom(domEvents, eventType).bind(Objects.readOpt(targetId)).map(function (h) {
      return {
        descHandler: Fun.constant({
          handler: h,
          purpose: Fun.constant('purpose')
        }),
        element: Fun.constant(target)
      };
    });
  };

  var container = Element.fromTag('div');
  var body = Element.fromDom(document.body);

  var sCheck = function (label, expected, target, eventType) {
    return Logger.t(label, Step.sync(function () {
      Html.set(container, '<div data-event-id="alpha"><div data-event-id="beta"><div data-event-id="gamma"></div></div></div>');
      var targetEl = SelectorFind.descendant(container, '[data-event-id="' + target + '"]').getOrDie();
      Triggers.triggerOnUntilStopped(lookup, eventType, { }, targetEl, logger);
      Assertions.assertEq(label, expected, log.slice(0));
      log = [ ];
    }));
  };


  Insert.append(body, container);

  var cases = [
    { expected: [ 'gamma', 'beta', 'alpha' ], target: 'gamma', type: 'no.stop' },
    { expected: [ 'beta', 'alpha' ], target: 'beta', type: 'no.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'no.stop' },

    { expected: [ 'gamma' ], target: 'gamma', type: 'gamma.stop' },
    { expected: [ 'beta', 'alpha' ], target: 'beta', type: 'gamma.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'gamma.stop' },

    { expected: [ 'gamma', 'beta' ], target: 'gamma', type: 'beta.stop' },
    { expected: [ 'beta' ], target: 'beta', type: 'beta.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'beta.stop' },

    { expected: [ 'gamma', 'beta', 'alpha' ], target: 'gamma', type: 'alpha.stop' },
    { expected: [ 'beta', 'alpha' ], target: 'beta', type: 'alpha.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'alpha.stop' },

    { expected: [ 'gamma' ], target: 'gamma', type: 'gamma.beta.stop' },
    { expected: [ 'beta' ], target: 'beta', type: 'gamma.beta.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'gamma.beta.stop' },

    { expected: [ 'gamma' ], target: 'gamma', type: 'gamma.alpha.stop' },
    { expected: [ 'beta', 'alpha' ], target: 'beta', type: 'gamma.alpha.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'gamma.alpha.stop' },

    { expected: [ 'gamma', 'beta' ], target: 'gamma', type: 'beta.alpha.stop' },
    { expected: [ 'beta' ], target: 'beta', type: 'beta.alpha.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'beta.alpha.stop' },

    { expected: [ 'gamma' ], target: 'gamma', type: 'all.stop' },
    { expected: [ 'beta' ], target: 'beta', type: 'all.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'all.stop' }
  ];

  var steps = Arr.map(cases, function (c) {
    return sCheck(
      'fire(' + c.target + ') using event: ' + c.type,
      c.expected,
      c.target,
      c.type
    );
  });

  Pipeline.async({}, steps, function () { success(); }, failure);
});

